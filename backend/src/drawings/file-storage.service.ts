import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

/**
 * Сервис для работы с файлами
 * Обрабатывает сохранение и конвертацию изображений в WebP формат
 */
@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'drawings');

  constructor() {
    // Создаем директорию для загрузок при инициализации
    this.ensureUploadsDirectory();
  }

  /**
   * Создание директории для загрузок, если она не существует
   */
  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      this.logger.log(`Uploads directory ensured: ${this.uploadsDir}`);
    } catch (error) {
      this.logger.error(
        `Failed to create uploads directory: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Сохранение изображения в формате WebP
   * @param imageData Base64 строка изображения
   * @param matchId ID матча для генерации имени файла
   * @returns URL сохраненного файла
   */
  async saveImageAsWebP(imageData: string, matchId: string): Promise<string> {
    try {
      // Извлекаем base64 данные из data URL
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Генерируем имя файла
      const fileName = `${matchId}-${Date.now()}.webp`;
      const filePath = path.join(this.uploadsDir, fileName);

      // Конвертируем в WebP и сохраняем
      await sharp(imageBuffer)
        .webp({ quality: 85, effort: 6 })
        .toFile(filePath);

      // Возвращаем относительный путь для URL
      const imageUrl = `/uploads/drawings/${fileName}`;

      this.logger.log(`Image saved as WebP: ${imageUrl}`);

      return imageUrl;
    } catch (error) {
      this.logger.error(
        `Failed to save image as WebP: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process image: ${error.message}`,
      );
    }
  }

  /**
   * Получение пути к файлу изображения
   * @param imageUrl URL изображения
   * @returns Абсолютный путь к файлу
   */
  getImagePath(imageUrl: string): string {
    // Извлекаем имя файла из URL
    const fileName = path.basename(imageUrl);
    return path.join(this.uploadsDir, fileName);
  }

  /**
   * Проверка существования файла
   * @param imageUrl URL изображения
   * @returns true если файл существует
   */
  async fileExists(imageUrl: string): Promise<boolean> {
    try {
      const filePath = this.getImagePath(imageUrl);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Удаление файла
   * @param imageUrl URL изображения
   */
  async deleteFile(imageUrl: string): Promise<void> {
    try {
      const filePath = this.getImagePath(imageUrl);
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${imageUrl}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${imageUrl}: ${error.message}`);
    }
  }
}
