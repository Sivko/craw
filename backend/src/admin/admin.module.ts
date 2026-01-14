import { Module } from '@nestjs/common';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { AdminGuard } from './guards/admin.guard';

/**
 * Модуль админки
 * Объединяет все админские модули
 */
@Module({
  imports: [DictionariesModule],
  providers: [AdminGuard],
  exports: [AdminGuard],
})
export class AdminModule {}
