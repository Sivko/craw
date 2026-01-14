import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDictionaryDto } from './create-dictionary.dto';

/**
 * DTO для массового создания слов
 */
export class BulkCreateDictionaryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDictionaryDto)
  words: CreateDictionaryDto[];
}
