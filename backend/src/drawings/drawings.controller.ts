import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { DrawingsService } from './drawings.service';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import {
  DrawingResponseDto,
  DrawingsListResponseDto,
} from './dto/drawing-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileStorageService } from './file-storage.service';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Контроллер для работы с рисунками
 * Обрабатывает HTTP запросы для загрузки и получения рисунков
 */
@Controller('drawings')
export class DrawingsController {
  constructor(
    private readonly drawingsService: DrawingsService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   * Загрузка рисунка
   * POST /drawings
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  async uploadDrawing(
    @CurrentUser() user: any,
    @Body() createDrawingDto: CreateDrawingDto,
  ): Promise<DrawingResponseDto> {
    return this.drawingsService.uploadDrawing(user.id, createDrawingDto);
  }

  /**
   * Получение рисунка по ID
   * GET /drawings/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDrawingById(@Param('id') id: string): Promise<DrawingResponseDto> {
    return this.drawingsService.getDrawingById(id);
  }

  /**
   * Получение файла изображения
   * GET /drawings/:id/file
   */
  @Get(':id/file')
  @HttpCode(HttpStatus.OK)
  async getDrawingFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const drawingResponse = await this.drawingsService.getDrawingById(id);

    if (!drawingResponse.data) {
      throw new NotFoundException('Drawing not found');
    }

    const imageUrl = drawingResponse.data.imageUrl;
    const filePath = this.fileStorageService.getImagePath(imageUrl);

    try {
      // Проверяем существование файла
      await fs.access(filePath);

      // Отправляем файл
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${path.basename(filePath)}"`,
      );
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      throw new NotFoundException('Drawing file not found');
    }
  }

  /**
   * Получение рисунков пользователя
   * GET /drawings/user/:userId
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserDrawings(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<DrawingsListResponseDto> {
    return this.drawingsService.getUserDrawings(userId, limit, offset);
  }
}
