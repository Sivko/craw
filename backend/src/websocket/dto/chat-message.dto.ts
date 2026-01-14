import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для сообщения чата через WebSocket
 */
export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
