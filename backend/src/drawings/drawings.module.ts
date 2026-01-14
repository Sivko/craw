import { Module } from '@nestjs/common';
import { DrawingsController } from './drawings.controller';
import { DrawingsService } from './drawings.service';
import { DrawingsRepository } from './drawings.repository';
import { FileStorageService } from './file-storage.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Модуль рисунков
 * Предоставляет функциональность загрузки, конвертации и получения рисунков
 */
@Module({
  imports: [PrismaModule],
  controllers: [DrawingsController],
  providers: [DrawingsService, DrawingsRepository, FileStorageService],
  exports: [DrawingsService, DrawingsRepository],
})
export class DrawingsModule {}
