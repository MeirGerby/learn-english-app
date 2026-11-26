import { type Db, materials } from '@learn-english/db';
import {
  MAX_MATERIAL_BYTES,
  type MaterialOutput,
  type UploadMaterialInput,
} from '@learn-english/english-contract';
import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';

const PDF_MAGIC = '%PDF';

const listColumns = {
  id: materials.id,
  filename: materials.filename,
  caption: materials.caption,
  fileSize: materials.fileSize,
  createdAt: materials.createdAt,
};

type MaterialRow = {
  id: string;
  filename: string;
  caption: string;
  fileSize: number;
  createdAt: Date;
};

function toOutput(row: MaterialRow): MaterialOutput {
  return { ...row, createdAt: row.createdAt.getTime() };
}

export class MaterialsService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  async list(): Promise<MaterialOutput[]> {
    const rows = await this.db
      .select(listColumns)
      .from(materials)
      .orderBy(desc(materials.createdAt));

    return rows.map(toOutput);
  }

  async upload(input: UploadMaterialInput): Promise<MaterialOutput> {
    const buffer = Buffer.from(input.fileBase64, 'base64');

    if (buffer.length === 0 || buffer.length > MAX_MATERIAL_BYTES) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `The file must be between 1 byte and ${MAX_MATERIAL_BYTES} bytes.`,
      });
    }

    if (buffer.subarray(0, 4).toString('latin1') !== PDF_MAGIC) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The uploaded file does not look like a PDF.',
      });
    }

    const [row] = await this.db
      .insert(materials)
      .values({
        filename: input.filename,
        caption: input.caption,
        fileSize: buffer.length,
        fileDataBase64: input.fileBase64,
      })
      .returning(listColumns);

    if (!row) throw new Error('The material insert returned no row');

    return toOutput(row);
  }

  async findFile(
    id: string,
  ): Promise<{ filename: string; buffer: Buffer } | undefined> {
    const [row] = await this.db
      .select({
        filename: materials.filename,
        fileDataBase64: materials.fileDataBase64,
      })
      .from(materials)
      .where(eq(materials.id, id))
      .limit(1);

    return row
      ? {
          filename: row.filename,
          buffer: Buffer.from(row.fileDataBase64, 'base64'),
        }
      : undefined;
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(materials).where(eq(materials.id, id));
  }
}
