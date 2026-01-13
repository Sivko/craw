import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GuessWordDto } from './dto/guess-word.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MatchResponseDto } from './dto/match-response.dto';

/**
 * Контроллер для работы с играми
 * Обрабатывает HTTP запросы для управления матчами
 */
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Начало игры в комнате
   * POST /games/:roomId/start
   */
  @Post(':roomId/start')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async startGame(
    @CurrentUser() user: any,
    @Param('roomId') roomId: string,
  ): Promise<MatchResponseDto> {
    return this.gamesService.startGame(roomId, user.id);
  }

  /**
   * Отправка предположения
   * POST /games/:roomId/guess
   */
  @Post(':roomId/guess')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async guessWord(
    @CurrentUser() user: any,
    @Param('roomId') roomId: string,
    @Body() guessWordDto: GuessWordDto,
  ): Promise<MatchResponseDto> {
    return this.gamesService.guessWord(roomId, user.id, guessWordDto);
  }

  /**
   * Получение текущего матча
   * GET /games/:roomId/current
   */
  @Get(':roomId/current')
  @HttpCode(HttpStatus.OK)
  async getCurrentMatch(
    @Param('roomId') roomId: string,
  ): Promise<MatchResponseDto> {
    return this.gamesService.getCurrentMatch(roomId);
  }
}
