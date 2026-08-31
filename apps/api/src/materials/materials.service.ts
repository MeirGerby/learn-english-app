import { Injectable } from '@nestjs/common';
import { MaterialsRepository } from './materials.repository.js';
import { MAX_FILE_BYTES } from './dto/materials.dto.js';
import type { MaterialOutput, UploadMaterialInput } from './dto/materials.dto.js';

export class InvalidPdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPdfError';
  }
}

export class MaterialNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Material '${id}' was not found.`);
    this.name = 'MaterialNotFoundError';
  }
}

const PDF_MAGIC = '%PDF';

@Injectable()
export class MaterialsService {
  constructor(private readonly materialsRepository: MaterialsRepository) {}

  async list(): Promise<MaterialOutput[]> {
    const rows = await this.materialsRepository.list();
    return rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      caption: row.caption,
      fileSize: row.fileSize,
      createdAt: row.createdAt.getTime(),
    }));
  }

  async upload(data: UploadMaterialInput): Promise<MaterialOutput> {
    let buffer: Buffer;
    try {
      buffer = Buffer.from(data.fileBase64, 'base64');
    } catch {
      throw new InvalidPdfError('The uploaded file is not valid base64 data.');
    }

    if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) {
      throw new InvalidPdfError(`The file must be between 1 byte and ${MAX_FILE_BYTES} bytes.`);
    }
    if (buffer.subarray(0, 4).toString('latin1') !== PDF_MAGIC) {
      throw new InvalidPdfError('The uploaded file does not look like a PDF.');
    }

    const row = await this.materialsRepository.create({
      filename: data.filename,
      caption: data.caption,
      fileSize: buffer.length,
      fileDataBase64: data.fileBase64,
    });

    return {
      id: row.id,
      filename: row.filename,
      caption: row.caption,
      fileSize: row.fileSize,
      createdAt: row.createdAt.getTime(),
    };
  }

  async getFileForDownload(id: string): Promise<{ filename: string; buffer: Buffer }> {
    const row = await this.materialsRepository.findById(id);
    if (!row) {
      throw new MaterialNotFoundError(id);
    }
    return { filename: row.filename, buffer: Buffer.from(row.fileDataBase64, 'base64') };
  }

  async remove(id: string): Promise<void> {
    await this.materialsRepository.remove(id);
  }
}
