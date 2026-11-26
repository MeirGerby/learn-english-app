import { desc, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // Computed once at registration by checking the email against the
  // server-only ADMIN_EMAILS env var - never retroactive if that list
  // changes later (would need a manual UPDATE).
  isAdmin: boolean('is_admin').notNull().default(false),
  // Nullable - existing users have none until they set one. Lets the
  // teacher dashboard show a name instead of a raw email.
  displayName: text('display_name'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// No categories table - the 10 categories/bands/Hebrew labels are a fixed,
// code-level taxonomy (see @learn-english/shared's constants.ts), never
// created/edited at runtime. category is validated at the zod/tRPC layer
// against that shared CategoryKey enum, not a DB foreign key.
//
// No `band` column either - band is a pure function of category
// (CATEGORY_BANDS in packages/shared), so storing both would invite drift.
export const words = pgTable(
  'words',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category: text('category').notNull(),
    // Frozen at creation, never re-derived from `word` - editing a word's
    // text must not change its slug, or the (idempotent-seeding) seed
    // script would treat it as a missing row and re-insert the original
    // alongside the edit.
    slug: text('slug').notNull(),
    word: text('word').notNull(),
    translation: text('translation').notNull(),
    example: text('example').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    // NULL = active. Archived words disappear from games and browsing but
    // keep every user_word_progress row pointing at them intact - words
    // are archived, never hard-deleted, once student progress exists.
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('words_category_slug_unique').on(t.category, t.slug),
    index('words_category_idx').on(t.category),
    // Every gameplay read filters to active words; a partial index keeps
    // it cheap as the archived set grows.
    index('words_active_category_idx')
      .on(t.category)
      .where(sql`${t.archivedAt} IS NULL`),
  ],
);

// roundsCompleted as jsonb and achievements as a text[] (not normalized
// tables) - both are small, code-defined enums, and the app always
// reads/writes the whole stats object as one shape. A normalized model
// would need a join+aggregation on every read for no benefit at this
// app's scale (a teacher + a handful of students, not a multi-tenant
// SaaS with real concurrent-writer contention).
export const userStats = pgTable('user_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalScore: integer('total_score').notNull().default(0),
  totalCorrect: integer('total_correct').notNull().default(0),
  totalIncorrect: integer('total_incorrect').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  roundsCompleted: jsonb('rounds_completed').notNull().default({}),
  achievements: text('achievements')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  placementBand: smallint('placement_band'),
  placementScore: integer('placement_score'),
  placementTotalQuestions: integer('placement_total_questions'),
  placementCompletedAt: timestamp('placement_completed_at', {
    withTimezone: true,
  }),
});

export const courseItems = pgTable('course_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // "video" | "image", enforced at the zod/tRPC layer
  url: text('url').notNull(),
  caption: text('caption').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Admin-only "notes to self" log (not student-submitted feedback) - only
// reachable from the admin panel. authorId is a proper FK now that real
// user rows exist (an improvement over the old denormalized authorEmail
// string); the router joins to users to produce authorEmail for display.
export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// tokenHash stores a SHA-256 hash of the raw token sent in the reset
// email, never the token itself - matches how passwordHash never stores
// a plaintext password. One row per requested reset; consumed (deleted)
// on successful use or superseded by a newer request for the same user.
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('password_reset_tokens_user_id_idx').on(t.userId)],
);

// PDF content stored as base64 text rather than a native bytea column -
// avoids needing a custom Drizzle column type and any driver-specific
// bytea encoding quirks, at the cost of ~33% storage overhead. Fine at
// this app's scale (a teacher's worksheets, not bulk file storage).
export const materials = pgTable(
  'materials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    filename: text('filename').notNull(),
    caption: text('caption').notNull().default(''),
    fileSize: integer('file_size').notNull(),
    fileDataBase64: text('file_data_base64').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('materials_created_at_idx').on(t.createdAt)],
);

// One row per (user, word), upserted on every answer. The (user_id,
// word_id) pair is the identity - no surrogate id, since a surrogate would
// need a separate unique index on the same pair anyway.
export const userWordProgress = pgTable(
  'user_word_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // RESTRICT, not cascade: words are archived rather than deleted (see
    // words.archivedAt), so a real delete here means someone bypassed the
    // app - fail loudly rather than silently destroy student history.
    wordId: uuid('word_id')
      .notNull()
      .references(() => words.id, { onDelete: 'restrict' }),
    timesSeen: integer('times_seen').notNull().default(0),
    timesCorrect: integer('times_correct').notNull().default(0),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    // NULL = never answered correctly yet - distinguishable from "not seen".
    lastCorrectAt: timestamp('last_correct_at', { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.wordId] }),
    // Teacher dashboard: "which words does the whole class struggle with"
    // scans by word, which the user-leading PK can't serve.
    index('user_word_progress_word_id_idx').on(t.wordId),
  ],
);

// One row per completed game round (not per answer - see the design
// discussion for why per-round was chosen). Powers activity history,
// daily streaks, and per-game/per-category trends over time - all of
// which user_stats' lifetime scalars can't answer.
export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    game: text('game').notNull(), // GameKey, validated at the zod/tRPC layer
    // NULL = not category-scoped. Speed Round deliberately draws from
    // every category, so it has no single category to record.
    category: text('category'),
    correctCount: integer('correct_count').notNull(),
    totalCount: integer('total_count').notNull(),
    score: integer('score').notNull(),
    // Client-reported, optional. Server owns completedAt; a client-sent
    // startedAt would be clock-skew prone for no real benefit.
    durationSeconds: integer('duration_seconds'),
    completedAt: timestamp('completed_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Dominant query: one student's recent activity + daily-streak
    // derivation. Streaks must be computed with `completed_at AT TIME
    // ZONE 'Asia/Jerusalem'`, not a bare UTC date, or a late-night session
    // lands on the wrong day.
    index('practice_sessions_user_completed_idx').on(
      t.userId,
      desc(t.completedAt),
    ),
    // Teacher dashboard: recent activity across all students / "who's
    // gone quiet".
    index('practice_sessions_completed_idx').on(desc(t.completedAt)),
  ],
);
