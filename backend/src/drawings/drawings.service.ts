import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DrawingsRepository } from './drawings.repository';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import {
  DrawingResponse,
  DrawingResponseDto,
  DrawingsListResponseDto,
} from './dto/drawing-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from './file-storage.service';

/**
 * Сервис для работы с рисунками
 * Содержит бизнес-логику загрузки, конвертации и получения рисунков
 */
@Injectable()
export class DrawingsService {
  private readonly logger = new Logger(DrawingsService.name);

  constructor(
    private readonly drawingsRepository: DrawingsRepository,
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   * Загрузка и сохранение рисунка
   */
  async uploadDrawing(
    userId: string,
    dto: CreateDrawingDto,
  ): Promise<DrawingResponseDto> {
    // Проверяем, что матч существует и принадлежит пользователю
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      include: {
        drawer: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with id ${dto.matchId} not found`);
    }

    // Проверяем, что пользователь является художником этого матча
    if (match.drawerId !== userId) {
      throw new BadRequestException(
        'Only the drawer can upload a drawing for this match',
      );
    }

    // Конвертируем и сохраняем изображение в WebP
    const imageUrl = await this.fileStorageService.saveImageAsWebP(
      dto.imageData,
      dto.matchId,
    );

    // Создаем запись в БД
    const drawing = await this.drawingsRepository.create(
      dto.matchId,
      userId,
      imageUrl,
    );

    this.logger.log(
      `Drawing uploaded for match ${dto.matchId} by user ${userId}`,
    );

    return {
      success: true,
      data: this.mapToDrawingResponse(drawing),
      error: null,
    };
  }

  /**
   * Получение рисунка по ID
   */
  async getDrawingById(id: string): Promise<DrawingResponseDto> {
    const drawing = await this.drawingsRepository.findById(id);

    return {
      success: true,
      data: this.mapToDrawingResponse(drawing),
      error: null,
    };
  }

  /**
   * Получение рисунка по matchId
   */
  async getDrawingByMatchId(matchId: string): Promise<DrawingResponseDto> {
    const drawing = await this.drawingsRepository.findByMatchId(matchId);

    if (!drawing) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: this.mapToDrawingResponse(drawing),
      error: null,
    };
  }

  /**
   * Получение всех рисунков пользователя
   */
  async getUserDrawings(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<DrawingsListResponseDto> {
    const drawings = await this.drawingsRepository.findByUserId(
      userId,
      limit,
      offset,
    );

    return {
      success: true,
      data: drawings.map((drawing) => this.mapToDrawingResponse(drawing)),
      error: null,
    };
  }

  /**
   * Преобразование Prisma модели в DrawingResponse
   */
  private mapToDrawingResponse(drawing: any): DrawingResponse {
    return {
      id: drawing.id,
      matchId: drawing.matchId,
      userId: drawing.user.id,
      userName: drawing.user.name,
      imageUrl: drawing.imageUrl,
      createdAt: drawing.createdAt,
    };
  }
}
