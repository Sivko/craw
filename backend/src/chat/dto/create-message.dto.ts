import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO для создания сообщения в чате
 */
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  message: string;
}
