import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DictionariesRepository } from './dictionaries.repository';
import { CreateDictionaryDto, Difficulty } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { BulkCreateDictionaryDto } from './dto/bulk-create.dto';

/**
 * Сервис для работы со словарями
 */
@Injectable()
export class DictionariesService {
  private readonly logger = new Logger(DictionariesService.name);

  constructor(
    private readonly dictionariesRepository: DictionariesRepository,
  ) {}

  /**
   * Получение всех слов с фильтрацией
   */
  async findAll(filters?: {
    difficulty?: Difficulty;
    isActive?: boolean;
    language?: string;
  }) {
    return this.dictionariesRepository.findAll(filters);
  }

  /**
   * Получение слова по ID
   */
  async findById(id: string) {
    const word = await this.dictionariesRepository.findById(id);
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    return word;
  }

  /**
   * Создание слова
   */
  async create(dto: CreateDictionaryDto) {
    // Проверяем уникальность слова для уровня сложности
    const existing = await this.dictionariesRepository.findAll({
      difficulty: dto.difficulty,
      language: dto.language || 'ru',
    });

    const normalizedWord = dto.word.trim().toLowerCase();
    const isDuplicate = existing.some(
      (w) => w.word.trim().toLowerCase() === normalizedWord,
    );

    if (isDuplicate) {
      throw new BadRequestException(
        `Word "${dto.word}" already exists for difficulty "${dto.difficulty}"`,
      );
    }

    return this.dictionariesRepository.create({
      word: dto.word.trim(),
      difficulty: dto.difficulty,
      language: dto.language || 'ru',
    });
  }

  /**
   * Обновление слова
   */
  async update(id: string, dto: UpdateDictionaryDto) {
    await this.findById(id); // Проверяем существование

    if (dto.word) {
      dto.word = dto.word.trim();
    }

    return this.dictionariesRepository.update(id, dto);
  }

  /**
   * Деактивация слова (мягкое удаление)
   */
  async deactivate(id: string) {
    await this.findById(id); // Проверяем существование
    return this.dictionariesRepository.deactivate(id);
  }

  /**
   * Массовое создание слов
   */
  async bulkCreate(dto: BulkCreateDictionaryDto) {
    const result = await this.dictionariesRepository.bulkCreate(dto.words);
    this.logger.log(`Bulk created ${result.count} words`);
    return result;
  }

  /**
   * Получение статистики по словарям
   */
  async getStats() {
    return this.dictionariesRepository.getStats();
  }
}
