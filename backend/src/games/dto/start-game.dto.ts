import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO для начала игры
 */
export class StartGameDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
