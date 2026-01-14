import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * DTO для загрузки рисунка
 * Принимает base64 строку изображения или WebP данные
 */
export class CreateDrawingDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^data:image\/(png|jpeg|jpg|webp);base64,/, {
    message:
      'Image must be a valid base64 encoded image (PNG, JPEG, JPG, or WebP)',
  })
  imageData: string;

  @IsString()
  @IsNotEmpty()
  matchId: string;
}
