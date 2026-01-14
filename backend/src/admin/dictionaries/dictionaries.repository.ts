import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Difficulty } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';

/**
 * Репозиторий для работы со словарями
 */
@Injectable()
export class DictionariesRepository {
  private readonly logger = new Logger(DictionariesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получение всех слов с фильтрацией
   */
  async findAll(filters?: {
    difficulty?: Difficulty;
    isActive?: boolean;
    language?: string;
  }) {
    return this.prisma.wordDictionary.findMany({
      where: {
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.language && { language: filters.language }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Получение слова по ID
   */
  async findById(id: string) {
    return this.prisma.wordDictionary.findUnique({
      where: { id },
    });
  }

  /**
   * Создание слова
   */
  async create(data: {
    word: string;
    difficulty: Difficulty;
    language?: string;
  }) {
    return this.prisma.wordDictionary.create({
      data: {
        word: data.word,
        difficulty: data.difficulty,
        language: data.language || 'ru',
        isActive: true,
      },
    });
  }

  /**
   * Обновление слова
   */
  async update(id: string, data: UpdateDictionaryDto) {
    return this.prisma.wordDictionary.update({
      where: { id },
      data,
    });
  }

  /**
   * Мягкое удаление слова (деактивация)
   */
  async deactivate(id: string) {
    return this.prisma.wordDictionary.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Массовое создание слов
   */
  async bulkCreate(words: Array<{ word: string; difficulty: Difficulty; language?: string }>) {
    return this.prisma.wordDictionary.createMany({
      data: words.map((word) => ({
        word: word.word,
        difficulty: word.difficulty,
        language: word.language || 'ru',
        isActive: true,
      })),
      skipDuplicates: true, // Пропускаем дубликаты
    });
  }

  /**
   * Получение статистики по словарям
   */
  async getStats() {
    const [total, active, inactive, byDifficulty] = await Promise.all([
      this.prisma.wordDictionary.count(),
      this.prisma.wordDictionary.count({ where: { isActive: true } }),
      this.prisma.wordDictionary.count({ where: { isActive: false } }),
      this.prisma.wordDictionary.groupBy({
        by: ['difficulty'],
        _count: true,
        where: { isActive: true },
      }),
    ]);

    const difficultyStats = byDifficulty.reduce(
      (acc, item) => {
        acc[item.difficulty] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      active,
      inactive,
      byDifficulty: {
        easy: difficultyStats.easy || 0,
        medium: difficultyStats.medium || 0,
        hard: difficultyStats.hard || 0,
      },
    };
  }
}
