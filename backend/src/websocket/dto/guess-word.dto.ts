import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для угадывания слова через WebSocket
 */
export class GuessWordDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  guess: string;
}
