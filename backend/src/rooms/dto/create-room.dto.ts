import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

/**
 * Уровни сложности игры
 */
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * DTO для создания комнаты
 */
export class CreateRoomDto {
  @IsEnum(Difficulty)
  @IsNotEmpty()
  difficulty: Difficulty;

  @IsInt()
  @Min(30)
  @Max(180)
  @IsNotEmpty()
  timer: number;
}
