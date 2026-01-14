import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для присоединения к комнате через WebSocket
 */
export class RoomJoinDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
