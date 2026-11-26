import {
  type Db,
  practiceSessions,
  userWordProgress,
  words,
} from '@learn-english/db';
import {
  GAME_KEYS,
  type GameKey,
  type ProgressSummaryOutput,
} from '@learn-english/english-contract';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

type SessionInput = {
  category?: string;
  correctCount: number;
  totalCount: number;
  score: number;
  durationSeconds?: number;
};

const WEAK_WORDS_LIMIT = 10;
const RECENT_SESSIONS_LIMIT = 10;
const STREAK_WINDOW_DAYS = 7;
// A word counts as weak only after enough attempts to mean something.
const MIN_TIMES_SEEN = 3;

function isGameKey(value: string): value is GameKey {
  return GAME_KEYS.some((key) => key === value);
}

export class ProgressService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  async recordWordAnswer(userId: string, wordId: string, correct: boolean) {
    await this.db
      .insert(userWordProgress)
      .values({
        userId,
        wordId,
        timesSeen: 1,
        timesCorrect: correct ? 1 : 0,
        lastCorrectAt: correct ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [userWordProgress.userId, userWordProgress.wordId],
        set: {
          timesSeen: sql`${userWordProgress.timesSeen} + 1`,
          timesCorrect: sql`${userWordProgress.timesCorrect} + ${correct ? 1 : 0}`,
          lastSeenAt: sql`now()`,
          lastCorrectAt: correct
            ? sql`now()`
            : sql`${userWordProgress.lastCorrectAt}`,
        },
      });
  }

  async recordSession(userId: string, game: GameKey, session: SessionInput) {
    await this.db.insert(practiceSessions).values({
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
    const [wordsPracticed, weakWords, recentSessions, practiceDaysThisWeek] =
      await Promise.all([
        this.countWordsPracticed(userId),
        this.findWeakWords(userId),
        this.recentSessions(userId),
        this.practiceDays(userId),
      ]);

    return {
      wordsPracticed,
      weakWords,
      recentSessions: recentSessions.flatMap((session) =>
        isGameKey(session.game)
          ? [
              {
                id: session.id,
                game: session.game,
                category: session.category ?? undefined,
                correctCount: session.correctCount,
                totalCount: session.totalCount,
                score: session.score,
                completedAt: session.completedAt.getTime(),
              },
            ]
          : [],
      ),
      practiceDaysThisWeek,
    };
  }

  private async countWordsPracticed(userId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userWordProgress)
      .where(eq(userWordProgress.userId, userId));

    return row?.count ?? 0;
  }

  private findWeakWords(userId: string) {
    return this.db
      .select({
        wordId: userWordProgress.wordId,
        word: words.word,
        translation: words.translation,
        timesSeen: userWordProgress.timesSeen,
        timesCorrect: userWordProgress.timesCorrect,
      })
      .from(userWordProgress)
      .innerJoin(words, eq(words.id, userWordProgress.wordId))
      .where(
        and(
          eq(userWordProgress.userId, userId),
          gte(userWordProgress.timesSeen, MIN_TIMES_SEEN),
        ),
      )
      .orderBy(
        sql`${userWordProgress.timesCorrect}::float / ${userWordProgress.timesSeen}`,
      )
      .limit(WEAK_WORDS_LIMIT);
  }

  private recentSessions(userId: string) {
    return this.db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.completedAt))
      .limit(RECENT_SESSIONS_LIMIT);
  }

  // Days are counted in Israel time, so a late-night session lands on the
  // right day.
  private async practiceDays(userId: string): Promise<number> {
    const rows = await this.db
      .selectDistinct({
        day: sql<string>`(${practiceSessions.completedAt} AT TIME ZONE 'Asia/Jerusalem')::date`,
      })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          gte(
            practiceSessions.completedAt,
            sql`now() - ${STREAK_WINDOW_DAYS}::int * interval '1 day'`,
          ),
        ),
      );

    return rows.length;
  }
}
