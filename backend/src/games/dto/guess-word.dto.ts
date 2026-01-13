import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO для отправки предположения
 */
export class GuessWordDto {
  @IsString()
  @IsNotEmpty()
  guess: string;
}
