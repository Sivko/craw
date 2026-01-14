import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

/**
 * DTO для события рисования
 */
export class DrawingEventDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(['draw', 'clear', 'undo', 'redo'])
  action: 'draw' | 'clear' | 'undo' | 'redo';

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsNumber()
  @IsOptional()
  prevX?: number;

  @IsNumber()
  @IsOptional()
  prevY?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  brushSize?: number;

  @IsNumber()
  timestamp: number;
}
