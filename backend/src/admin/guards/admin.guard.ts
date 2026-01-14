import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard для защиты админских эндпоинтов
 * Проверяет наличие и правильность секретного ключа в заголовке X-Admin-Secret
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminSecret = request.headers['x-admin-secret'];
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET');

    if (!expectedSecret) {
      this.logger.error('ADMIN_SECRET not configured');
      throw new UnauthorizedException('Admin access not configured');
    }

    if (!adminSecret || adminSecret !== expectedSecret) {
      this.logger.warn(
        `Unauthorized admin access attempt from ${request.ip}`,
      );
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
