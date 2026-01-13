import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO для гостевой авторизации
 */
export class GuestAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
