import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { GuestAuthDto } from './dto/guest-auth.dto';
import { Public } from './decorators/public.decorator';

/**
 * Контроллер авторизации
 * Обрабатывает запросы на авторизацию через Telegram и гостевой вход
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Авторизация через Telegram MiniApp
   * POST /auth/telegram
   */
  @Post('telegram')
  @Public()
  @HttpCode(HttpStatus.OK)
  async authenticateTelegram(@Body() telegramAuthDto: TelegramAuthDto) {
    return this.authService.authenticateTelegram(telegramAuthDto);
  }

  /**
   * Гостевой вход
   * POST /auth/guest
   */
  @Post('guest')
  @Public()
  @HttpCode(HttpStatus.OK)
  async authenticateGuest(@Body() guestAuthDto: GuestAuthDto) {
    return this.authService.authenticateGuest(guestAuthDto);
  }
}
