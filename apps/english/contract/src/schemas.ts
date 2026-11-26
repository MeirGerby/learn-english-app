import { z } from 'zod';
import { CATEGORY_KEYS, GAME_KEYS } from './constants.js';

const Password = z.string().min(8).max(200);

export const BandSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const GameKeySchema = z.enum(GAME_KEYS);

export const CategoryKeySchema = z.enum(CATEGORY_KEYS);

// --- auth ---------------------------------------------------------------

export const AuthUser = z.object({
  id: z.uuid(),
  email: z.email(),
  isAdmin: z.boolean(),
});

export type AuthUser = z.infer<typeof AuthUser>;

export const AuthOutput = z.object({ user: AuthUser, token: z.string() });

export const RegisterInput = z.object({ email: z.email(), password: Password });

export const LoginInput = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const RequestPasswordResetInput = z.object({ email: z.email() });

export const ResetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: Password,
});

export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: Password,
});

export const SuccessOutput = z.object({ success: z.literal(true) });

// --- words --------------------------------------------------------------

export const ListWordsInput = z.object({ category: CategoryKeySchema });

export const WordOutput = z.object({
  id: z.uuid(),
  category: z.string(),
  slug: z.string(),
  word: z.string(),
  translation: z.string(),
  example: z.string(),
});

// --- user stats -----------------------------------------------------------

// A plain string-keyed record: a round count exists only for games actually
// played, and an enum-keyed zod record would demand every key.
export const UserStatsOutput = z.object({
  totalScore: z.number(),
  totalCorrect: z.number(),
  totalIncorrect: z.number(),
  bestStreak: z.number(),
  roundsCompleted: z.record(z.string(), z.number()),
  achievements: z.array(z.string()),
  placementBand: BandSchema.optional(),
  placementScore: z.number().optional(),
  placementTotalQuestions: z.number().optional(),
  placementCompletedAt: z.number().optional(),
});

export type UserStatsOutput = z.infer<typeof UserStatsOutput>;

export const StatsWithUnlocksOutput = z.object({
  stats: UserStatsOutput,
  newlyUnlocked: z.array(z.string()),
});

export const RecordAnswerInput = z.object({
  points: z.number().optional(),
  correct: z.boolean(),
  currentStreak: z.number().optional(),
  // Absent when the round came from the bundled fallback list, which has
  // no database ids. When present, the word's progress row is updated.
  wordId: z.uuid().optional(),
});

export type RecordAnswerInput = z.infer<typeof RecordAnswerInput>;

// When correctCount, totalCount and score are all sent, a practice session
// row is recorded too. Speed Round spans every category, so it sends none.
export const RecordGameCompletedInput = z.object({
  gameKey: GameKeySchema,
  category: z.string().optional(),
  correctCount: z.number().optional(),
  totalCount: z.number().optional(),
  score: z.number().optional(),
  durationSeconds: z.number().optional(),
});

export type RecordGameCompletedInput = z.infer<typeof RecordGameCompletedInput>;

export const SavePlacementResultInput = z.object({
  band: BandSchema,
  score: z.number(),
  totalQuestions: z.number(),
});

// --- course content -------------------------------------------------------

export const CourseItemType = z.enum(['video', 'image']);

export const CourseItemOutput = z.object({
  id: z.uuid(),
  type: CourseItemType,
  url: z.url(),
  caption: z.string(),
  createdAt: z.number(),
});

export type CourseItemOutput = z.infer<typeof CourseItemOutput>;

export const AddCourseItemInput = z.object({
  type: CourseItemType,
  url: z.url(),
  caption: z.string().trim().max(300).optional().default(''),
});

export const IdInput = z.object({ id: z.uuid() });

// --- feedback -------------------------------------------------------------

export const FeedbackOutput = z.object({
  id: z.uuid(),
  text: z.string(),
  authorEmail: z.email(),
  createdAt: z.number(),
});

export const CreateFeedbackInput = z.object({
  text: z.string().trim().min(1).max(2000),
});

// --- materials --------------------------------------------------------------

export const MAX_MATERIAL_BYTES = 8 * 1024 * 1024;

const MAX_BASE64_CHARS = Math.ceil((MAX_MATERIAL_BYTES * 4) / 3) + 1024;

export const MaterialOutput = z.object({
  id: z.uuid(),
  filename: z.string(),
  caption: z.string(),
  fileSize: z.number(),
  createdAt: z.number(),
});

export type MaterialOutput = z.infer<typeof MaterialOutput>;

export const UploadMaterialInput = z.object({
  filename: z.string().trim().min(1).max(200),
  caption: z.string().trim().max(300).optional().default(''),
  fileBase64: z.string().min(1).max(MAX_BASE64_CHARS),
});

export type UploadMaterialInput = z.infer<typeof UploadMaterialInput>;

// --- progress and dashboard -------------------------------------------------

export const ProgressSummaryOutput = z.object({
  wordsPracticed: z.number(),
  weakWords: z.array(
    z.object({
      wordId: z.uuid(),
      word: z.string(),
      translation: z.string(),
      timesSeen: z.number(),
      timesCorrect: z.number(),
    }),
  ),
  recentSessions: z.array(
    z.object({
      id: z.uuid(),
      game: GameKeySchema,
      category: z.string().optional(),
      correctCount: z.number(),
      totalCount: z.number(),
      score: z.number(),
      completedAt: z.number(),
    }),
  ),
  practiceDaysThisWeek: z.number(),
});

export type ProgressSummaryOutput = z.infer<typeof ProgressSummaryOutput>;

export const StudentListItem = z.object({
  id: z.uuid(),
  email: z.string(),
  displayName: z.string().optional(),
  createdAt: z.number(),
  totalScore: z.number(),
  totalCorrect: z.number(),
  totalIncorrect: z.number(),
  bestStreak: z.number(),
  placementBand: BandSchema.optional(),
  lastActiveAt: z.number().optional(),
});

export type StudentListItem = z.infer<typeof StudentListItem>;

export const StudentSummaryInput = z.object({ userId: z.uuid() });
