import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { GamesRepository } from './games.repository';
import { RoomsRepository } from '../rooms/rooms.repository';
import { RedisStreamerService } from '../redis-streamer/redis-streamer.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchResponse, MatchResponseDto } from './dto/match-response.dto';
import { RoomStatus } from '../rooms/dto/room-response.dto';
import { GuessWordDto } from './dto/guess-word.dto';

/**
 * Сервис для работы с играми
 * Содержит бизнес-логику управления матчами, выбором слов и ротацией художника
 */
@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  // Храним активные таймеры матчей: roomId -> timer
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly roomsRepository: RoomsRepository,
    private readonly redisStreamer: RedisStreamerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Начало игры в комнате
   */
  async startGame(roomId: string, userId: string): Promise<MatchResponseDto> {
    // Проверяем, что комната существует
    const room = await this.roomsRepository.findById(roomId);

    // Проверяем, что пользователь является хостом
    if (room.hostId !== userId) {
      throw new BadRequestException('Only room host can start the game');
    }

    // Проверяем, что комната в статусе waiting
    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Game can only be started in waiting room');
    }

    // Проверяем, что нет активного матча
    const currentMatch = await this.gamesRepository.getCurrentMatch(roomId);
    if (currentMatch) {
      throw new BadRequestException('Game is already in progress');
    }

    // Получаем список пользователей комнаты
    const roomUsers = await this.gamesRepository.getRoomUsers(roomId);

    if (roomUsers.length < 2) {
      throw new BadRequestException(
        'At least 2 players are required to start the game',
      );
    }

    // Выбираем первого художника (первый по порядку присоединения)
    const drawer = roomUsers[0];
    const drawerId = drawer.user.id;

    // Получаем настройки комнаты
    const settings = room.settings as { difficulty: string; timer: number };
    const difficulty = settings.difficulty as any;
    const timer = settings.timer;

    // Выбираем случайное слово
    const word = await this.gamesRepository.getRandomWord(difficulty);

    // Создаем матч
    const match = await this.gamesRepository.createMatch(
      roomId,
      drawerId,
      word,
      difficulty,
    );

    // Обновляем статус комнаты на playing
    await this.roomsRepository.updateStatus(roomId, RoomStatus.PLAYING);

    // Публикуем событие начала игры
    await this.redisStreamer.publishRoomUpdate({
      roomId,
      type: 'game_started',
      data: {
        roomId,
        matchId: match.id,
      },
      timestamp: Date.now(),
    });

    // Публикуем событие начала матча
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'match_started',
      data: {
        matchId: match.id,
        drawerId: drawer.user.id,
        drawerName: drawer.user.name,
        difficulty,
        timer,
        startedAt: match.startedAt.toISOString(),
      },
      timestamp: Date.now(),
    });

    // Публикуем событие выбора слова (только для художника)
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'word_selected',
      data: {
        matchId: match.id,
        word, // Отправляем слово только художнику через WebSocket фильтрацию
        drawerId: drawer.user.id,
      },
      timestamp: Date.now(),
    });

    // Запускаем таймер матча
    this.startMatchTimer(roomId, match.id, timer);

    this.logger.log(
      `Game started in room ${roomId}, match ${match.id}, drawer: ${drawer.user.name}`,
    );

    return {
      success: true,
      data: this.mapToMatchResponse(match, timer),
      error: null,
    };
  }

  /**
   * Отправка предположения
   */
  async guessWord(
    roomId: string,
    userId: string,
    dto: GuessWordDto,
  ): Promise<MatchResponseDto> {
    // Проверяем, что комната существует
    const room = await this.roomsRepository.findById(roomId);

    // Проверяем, что комната в статусе playing
    if (room.status !== RoomStatus.PLAYING) {
      throw new BadRequestException('Room is not in playing status');
    }

    // Получаем текущий матч
    const match = await this.gamesRepository.getCurrentMatch(roomId);
    if (!match) {
      throw new NotFoundException('No active match found');
    }

    // Проверяем, что пользователь не является художником
    if (match.drawerId === userId) {
      throw new BadRequestException('Drawer cannot guess the word');
    }

    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Нормализуем слово для сравнения (убираем пробелы, приводим к нижнему регистру)
    const normalizedGuess = dto.guess.trim().toLowerCase();
    const normalizedWord = match.word.trim().toLowerCase();

    // Проверяем правильность ответа
    const isCorrect = normalizedGuess === normalizedWord;

    // Публикуем событие предположения
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'correct_guess',
      data: {
        matchId: match.id,
        userId: user.id,
        userName: user.name,
        guess: dto.guess,
        isCorrect,
      },
      timestamp: Date.now(),
    });

    if (isCorrect) {
      // Правильный ответ - завершаем матч
      await this.endMatch(roomId, match.id, userId);
    }

    return {
      success: true,
      data: this.mapToMatchResponse(match, null),
      error: null,
    };
  }

  /**
   * Получение текущего матча
   */
  async getCurrentMatch(roomId: string): Promise<MatchResponseDto> {
    const room = await this.roomsRepository.findById(roomId);
    const match = await this.gamesRepository.getCurrentMatch(roomId);

    if (!match) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    const settings = room.settings as { difficulty: string; timer: number };
    const timer = settings.timer;
    const elapsed = Math.floor((Date.now() - match.startedAt.getTime()) / 1000);
    const timeRemaining = Math.max(0, timer - elapsed);

    return {
      success: true,
      data: this.mapToMatchResponse(match, timeRemaining),
      error: null,
    };
  }

  /**
   * Завершение матча
   */
  private async endMatch(
    roomId: string,
    matchId: string,
    winnerId?: string,
  ): Promise<void> {
    // Получаем матч перед завершением, чтобы сохранить drawerId
    const matchBeforeEnd = await this.gamesRepository.getCurrentMatch(roomId);
    if (!matchBeforeEnd) {
      throw new NotFoundException('Match not found');
    }

    const drawerId = matchBeforeEnd.drawerId;

    // Останавливаем таймер
    this.stopMatchTimer(roomId);

    // Завершаем матч
    const match = await this.gamesRepository.endMatch(matchId);

    // Начисляем очки
    if (winnerId) {
      // Очки угадавшему игроку
      await this.gamesRepository.updateUserScore(roomId, winnerId, 10);
      // Очки художнику за успешное рисование
      await this.gamesRepository.updateUserScore(roomId, drawerId, 5);
    }

    // Получаем обновленную комнату с очками
    const room = await this.roomsRepository.findById(roomId);

    // Публикуем событие завершения матча
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'match_ended',
      data: {
        matchId: match.id,
        winnerId: winnerId || null,
        drawerId,
        word: match.word,
        endedAt: match.endedAt?.toISOString() || null,
        scores: room.users.map((ru: any) => ({
          userId: ru.user.id,
          userName: ru.user.name,
          score: ru.score,
        })),
      },
      timestamp: Date.now(),
    });

    // Ротация художника и начало следующего раунда
    await this.startNextRound(roomId, drawerId);
  }

  /**
   * Запуск следующего раунда (ротация художника)
   */
  private async startNextRound(
    roomId: string,
    previousDrawerId: string,
  ): Promise<void> {
    // Получаем список пользователей комнаты
    const roomUsers = await this.gamesRepository.getRoomUsers(roomId);

    if (roomUsers.length < 2) {
      // Недостаточно игроков - возвращаем комнату в статус waiting
      await this.roomsRepository.updateStatus(roomId, RoomStatus.WAITING);

      await this.redisStreamer.publishRoomUpdate({
        roomId,
        type: 'game_ended',
        data: {
          roomId,
          reason: 'not_enough_players',
        },
        timestamp: Date.now(),
      });

      return;
    }

    // Находим индекс предыдущего художника
    let currentDrawerIndex = roomUsers.findIndex(
      (ru) => ru.user.id === previousDrawerId,
    );

    // Если предыдущий художник не найден (например, при первом запуске), начинаем с первого
    if (currentDrawerIndex === -1) {
      currentDrawerIndex = 0;
    }

    // Выбираем следующего художника (циклическая ротация)
    const nextDrawerIndex = (currentDrawerIndex + 1) % roomUsers.length;
    const nextDrawer = roomUsers[nextDrawerIndex];

    // Получаем настройки комнаты
    const room = await this.roomsRepository.findById(roomId);
    const settings = room.settings as { difficulty: string; timer: number };
    const difficulty = settings.difficulty as any;
    const timer = settings.timer;

    // Выбираем случайное слово
    const word = await this.gamesRepository.getRandomWord(difficulty);

    // Создаем новый матч
    const match = await this.gamesRepository.createMatch(
      roomId,
      nextDrawer.user.id,
      word,
      difficulty,
    );

    // Публикуем событие смены художника
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'artist_changed',
      data: {
        matchId: match.id,
        drawerId: nextDrawer.user.id,
        drawerName: nextDrawer.user.name,
      },
      timestamp: Date.now(),
    });

    // Публикуем событие начала нового раунда
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'round_started',
      data: {
        matchId: match.id,
        drawerId: nextDrawer.user.id,
        drawerName: nextDrawer.user.name,
        difficulty,
        timer,
        startedAt: match.startedAt.toISOString(),
      },
      timestamp: Date.now(),
    });

    // Публикуем событие выбора слова (только для художника)
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'word_selected',
      data: {
        matchId: match.id,
        word, // Отправляем слово только художнику через WebSocket фильтрацию
        drawerId: nextDrawer.user.id,
      },
      timestamp: Date.now(),
    });

    // Запускаем таймер матча
    this.startMatchTimer(roomId, match.id, timer);

    this.logger.log(
      `Next round started in room ${roomId}, match ${match.id}, drawer: ${nextDrawer.user.name}`,
    );
  }

  /**
   * Запуск таймера матча
   */
  private startMatchTimer(
    roomId: string,
    matchId: string,
    timer: number,
  ): void {
    // Останавливаем предыдущий таймер, если есть
    this.stopMatchTimer(roomId);

    // Запускаем новый таймер
    const timeout = setTimeout(async () => {
      // Время истекло - завершаем матч
      await this.endMatchByTimeout(roomId, matchId);
    }, timer * 1000);

    this.activeTimers.set(roomId, timeout);
  }

  /**
   * Остановка таймера матча
   */
  private stopMatchTimer(roomId: string): void {
    const timeout = this.activeTimers.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimers.delete(roomId);
    }
  }

  /**
   * Завершение матча по таймауту
   */
  private async endMatchByTimeout(
    roomId: string,
    matchId: string,
  ): Promise<void> {
    // Публикуем событие таймаута
    await this.redisStreamer.publishGameEvent({
      roomId,
      type: 'timeout',
      data: {
        matchId,
      },
      timestamp: Date.now(),
    });

    // Завершаем матч без победителя
    await this.endMatch(roomId, matchId);
  }

  /**
   * Преобразование Prisma модели в MatchResponse
   */
  private mapToMatchResponse(
    match: any,
    timeRemaining: number | null,
  ): MatchResponse {
    const settings = match.room.settings as {
      difficulty: string;
      timer: number;
    };
    const timer = settings.timer;

    // Вычисляем оставшееся время
    let remaining = timer;
    if (timeRemaining !== null) {
      remaining = timeRemaining;
    } else if (match.endedAt) {
      remaining = 0;
    } else {
      const elapsed = Math.floor(
        (Date.now() - match.startedAt.getTime()) / 1000,
      );
      remaining = Math.max(0, timer - elapsed);
    }

    return {
      id: match.id,
      roomId: match.roomId,
      drawerId: match.drawer.id,
      drawerName: match.drawer.name,
      word: match.word,
      difficulty: match.difficulty,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      timer,
      timeRemaining: remaining,
    };
  }
}
