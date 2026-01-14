import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Difficulty } from './create-dictionary.dto';

/**
 * DTO для обновления слова в словаре
 */
export class UpdateDictionaryDto {
  @IsString()
  @IsOptional()
  word?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsString()
  @IsOptional()
  language?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
