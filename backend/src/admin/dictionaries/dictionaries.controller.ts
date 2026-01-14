import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DictionariesService } from './dictionaries.service';
import { AdminGuard } from '../guards/admin.guard';
import { CreateDictionaryDto, Difficulty } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { BulkCreateDictionaryDto } from './dto/bulk-create.dto';

/**
 * Контроллер для управления словарями (админка)
 * Все эндпоинты защищены AdminGuard
 */
@Controller('admin/dictionaries')
@UseGuards(AdminGuard)
export class DictionariesController {
  constructor(private readonly dictionariesService: DictionariesService) {}

  /**
   * Получение всех слов с фильтрацией
   */
  @Get()
  async findAll(
    @Query('difficulty') difficulty?: Difficulty,
    @Query('isActive') isActive?: string,
    @Query('language') language?: string,
  ) {
    const filters: any = {};
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (language) filters.language = language;

    const words = await this.dictionariesService.findAll(filters);
    return {
      success: true,
      data: words,
      error: null,
    };
  }

  /**
   * Получение слова по ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const word = await this.dictionariesService.findById(id);
    return {
      success: true,
      data: word,
      error: null,
    };
  }

  /**
   * Создание слова
   */
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateDictionaryDto) {
    const word = await this.dictionariesService.create(dto);
    return {
      success: true,
      data: word,
      error: null,
    };
  }

  /**
   * Обновление слова
   */
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() dto: UpdateDictionaryDto) {
    const word = await this.dictionariesService.update(id, dto);
    return {
      success: true,
      data: word,
      error: null,
    };
  }

  /**
   * Деактивация слова (мягкое удаление)
   */
  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    await this.dictionariesService.deactivate(id);
    return {
      success: true,
      data: null,
      error: null,
    };
  }

  /**
   * Массовое создание слов
   */
  @Post('bulk')
  @UsePipes(new ValidationPipe())
  async bulkCreate(@Body() dto: BulkCreateDictionaryDto) {
    const result = await this.dictionariesService.bulkCreate(dto);
    return {
      success: true,
      data: result,
      error: null,
    };
  }

  /**
   * Получение статистики по словарям
   */
  @Get('stats')
  async getStats() {
    const stats = await this.dictionariesService.getStats();
    return {
      success: true,
      data: stats,
      error: null,
    };
  }
}
