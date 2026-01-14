import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * DTO для создания слова в словаре
 */
export class CreateDictionaryDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsString()
  @IsOptional()
  language?: string;
}
