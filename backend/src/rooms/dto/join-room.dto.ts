import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для присоединения к комнате
 */
export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
