import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO для авторизации через Telegram MiniApp
 * Согласно документации Telegram: https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */
export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsString()
  @IsNotEmpty()
  auth_date: string;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
