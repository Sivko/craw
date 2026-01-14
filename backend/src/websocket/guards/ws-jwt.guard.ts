import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';

/**
 * Guard для WebSocket соединений с JWT аутентификацией
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromSocket(client);

    if (!token) {
      this.logger.warn('No token provided in WebSocket connection');
      throw new UnauthorizedException('Authentication token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'default-secret'),
      });

      // Валидируем пользователя
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Сохраняем пользователя в socket для дальнейшего использования
      client.data.user = user;
      client.data.userId = user.id;

      return true;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  /**
   * Извлекает токен из WebSocket соединения
   * Поддерживает токен в query параметрах или в auth объекте
   */
  private extractTokenFromSocket(client: Socket): string | null {
    // Проверяем query параметры
    const tokenFromQuery = client.handshake.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Проверяем auth объект
    const tokenFromAuth = client.handshake.auth?.token as string;
    if (tokenFromAuth) {
      return tokenFromAuth;
    }

    return null;
  }
}
