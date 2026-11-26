import { courseItems, type Db } from '@learn-english/db';
import {
  CourseItemType,
  type CourseItemOutput,
} from '@learn-english/english-contract';
import { desc, eq } from 'drizzle-orm';

type CourseItemRow = typeof courseItems.$inferSelect;

type NewCourseItem = Pick<CourseItemOutput, 'type' | 'url' | 'caption'>;

function toOutput(row: CourseItemRow): CourseItemOutput {
  return {
    id: row.id,
    type: CourseItemType.parse(row.type),
    url: row.url,
    caption: row.caption,
    createdAt: row.createdAt.getTime(),
  };
}

export class CourseContentService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  async list(): Promise<CourseItemOutput[]> {
    const rows = await this.db
      .select()
      .from(courseItems)
      .orderBy(desc(courseItems.createdAt));

    return rows.map(toOutput);
  }

  async add(item: NewCourseItem): Promise<CourseItemOutput> {
    const [row] = await this.db.insert(courseItems).values(item).returning();

    if (!row) throw new Error('The course item insert returned no row');

    return toOutput(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(courseItems).where(eq(courseItems.id, id));
  }
}
