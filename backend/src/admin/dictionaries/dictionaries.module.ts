import { Module } from '@nestjs/common';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { DictionariesRepository } from './dictionaries.repository';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Модуль для управления словарями (админка)
 */
@Module({
  imports: [PrismaModule],
  controllers: [DictionariesController],
  providers: [DictionariesService, DictionariesRepository],
  exports: [DictionariesService],
})
export class DictionariesModule {}
