import type {
  Band,
  RecordAnswerInput,
  RecordGameCompletedInput,
} from '@learn-english/english-contract';
import { showAchievementToasts } from '../components/achievement-toast';
import { getAuthToken } from './auth-token';
import { trpcClient } from './trpc';

// These writes are fire-and-forget: a game never awaits them, so a slow or
// failed save never blocks play. Anonymous visitors keep only the local
// score from useGameScore, so each call is a no-op without a token.

export async function recordAnswer(input: RecordAnswerInput): Promise<void> {
  if (!getAuthToken()) return;

  try {
    const { newlyUnlocked } =
      await trpcClient.userStats.recordAnswer.mutate(input);

    showAchievementToasts(newlyUnlocked);
  } catch (error) {
    console.warn('recordAnswer failed.', error);
  }
}

export async function recordGameCompleted(
  gameKey: RecordGameCompletedInput['gameKey'],
  session?: Omit<RecordGameCompletedInput, 'gameKey'>,
): Promise<void> {
  if (!getAuthToken()) return;

  try {
    const { newlyUnlocked } =
      await trpcClient.userStats.recordGameCompleted.mutate({
        gameKey,
        ...session,
      });

    showAchievementToasts(newlyUnlocked);
  } catch (error) {
    console.warn('recordGameCompleted failed.', error);
  }
}

export async function savePlacementResult(
  band: Band,
  score: number,
  totalQuestions: number,
): Promise<void> {
  if (!getAuthToken()) return;

  try {
    await trpcClient.userStats.savePlacementResult.mutate({
      band,
      score,
      totalQuestions,
    });
  } catch (error) {
    console.warn('savePlacementResult failed.', error);
  }
}
