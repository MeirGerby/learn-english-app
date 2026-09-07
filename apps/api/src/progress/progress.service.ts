import { Injectable } from '@nestjs/common';
import type { GameKey } from '@learn-english/shared';
import { ProgressRepository } from './progress.repository.js';
import type { ProgressSummaryOutput } from './dto/progress.dto.js';

export interface SessionInput {
  category?: string;
  correctCount: number;
  totalCount: number;
  score: number;
  durationSeconds?: number;
}

const WEAK_WORDS_LIMIT = 10;
const RECENT_SESSIONS_LIMIT = 10;
const STREAK_WINDOW_DAYS = 7;

@Injectable()
export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async recordWordAnswer(userId: string, wordId: string, correct: boolean) {
    await this.progressRepository.upsertWordProgress(userId, wordId, correct);
  }

  async recordSession(userId: string, game: GameKey, session: SessionInput) {
    await this.progressRepository.insertSession({
      userId,
      game,
      category: session.category ?? null,
      correctCount: session.correctCount,
      totalCount: session.totalCount,
      score: session.score,
      durationSeconds: session.durationSeconds ?? null,
    });
  }

  async getSummaryForUser(userId: string): Promise<ProgressSummaryOutput> {
    const [wordsPracticed, weakWords, recentSessions, practiceDaysThisWeek] = await Promise.all([
      this.progressRepository.countWordsPracticed(userId),
      this.progressRepository.findWeakWords(userId, WEAK_WORDS_LIMIT),
      this.progressRepository.recentSessions(userId, RECENT_SESSIONS_LIMIT),
      this.progressRepository.distinctPracticeDaysInRange(userId, STREAK_WINDOW_DAYS),
    ]);

    return {
      wordsPracticed,
      weakWords: weakWords.map((w) => ({
        wordId: w.wordId,
        word: w.word,
        translation: w.translation,
        timesSeen: w.timesSeen,
        timesCorrect: w.timesCorrect,
      })),
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        game: s.game as GameKey,
        category: s.category ?? undefined,
        correctCount: s.correctCount,
        totalCount: s.totalCount,
        score: s.score,
        completedAt: s.completedAt.getTime(),
      })),
      practiceDaysThisWeek,
    };
  }
}
