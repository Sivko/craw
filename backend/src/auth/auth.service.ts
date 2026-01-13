import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { GuestAuthDto } from './dto/guest-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as crypto from 'crypto';

/**
 * Сервис авторизации
 * Обеспечивает авторизацию через Telegram MiniApp и гостевой вход
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Валидация данных от Telegram MiniApp
   * Проверяет подпись hash согласно документации Telegram
   */
  private validateTelegramData(data: TelegramAuthDto): boolean {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured');
      return false;
    }

    // Создаем строку для проверки
    const dataCheckString = Object.keys(data)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${data[key as keyof TelegramAuthDto]}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем, что hash совпадает
    return hash === data.hash;
  }

  /**
   * Авторизация через Telegram MiniApp
   */
  async authenticateTelegram(
    telegramAuthDto: TelegramAuthDto,
  ): Promise<AuthResponseDto> {
    // Валидация данных от Telegram
    if (!this.validateTelegramData(telegramAuthDto)) {
      this.logger.warn('Invalid Telegram data hash');
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    // Проверяем, не устарели ли данные (24 часа)
    const authDate = parseInt(telegramAuthDto.auth_date, 10) * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа

    if (now - authDate > maxAge) {
      this.logger.warn('Telegram auth data expired');
      throw new UnauthorizedException('Authentication data expired');
    }

    // Ищем существующего пользователя или создаем нового
    const name = telegramAuthDto.last_name
      ? `${telegramAuthDto.first_name} ${telegramAuthDto.last_name}`
      : telegramAuthDto.first_name;

    let user = await this.prisma.user.findUnique({
      where: { telegramId: telegramAuthDto.id },
    });

    if (user) {
      // Обновляем данные пользователя
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          username: telegramAuthDto.username || null,
        },
      });
    } else {
      // Создаем нового пользователя
      user = await this.prisma.user.create({
        data: {
          telegramId: telegramAuthDto.id,
          name,
          username: telegramAuthDto.username || null,
        },
      });
    }

    // Генерируем JWT токен
    const token = this.generateToken(user.id);

    this.logger.log(`User authenticated via Telegram: ${user.id}`);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username || undefined,
          telegramId: user.telegramId || undefined,
        },
        token,
      },
      error: null,
    };
  }

  /**
   * Гостевой вход
   */
  async authenticateGuest(guestAuthDto: GuestAuthDto): Promise<AuthResponseDto> {
    // Создаем временного пользователя без telegramId
    const user = await this.prisma.user.create({
      data: {
        name: guestAuthDto.name.trim(),
      },
    });

    // Генерируем JWT токен
    const token = this.generateToken(user.id);

    this.logger.log(`Guest user created: ${user.id}`);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
        },
        token,
      },
      error: null,
    };
  }

  /**
   * Генерация JWT токена
   */
  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  /**
   * Валидация JWT токена и получение пользователя
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      telegramId: user.telegramId,
    };
  }
}
