import { z } from 'zod';

// ~8MB decoded PDF cap - generous for a teacher's worksheets/handouts,
// small enough to keep storing them as base64 text in Postgres sane.
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
// Base64 inflates size by ~4/3; cap the encoded string generously above
// the decoded limit so the real enforcement is the decoded-byte check
// in the service, not this string-length ceiling.
const MAX_BASE64_CHARS = Math.ceil((MAX_FILE_BYTES * 4) / 3) + 1024;

export const materialOutputSchema = z.object({
  id: z.uuid(),
  filename: z.string(),
  caption: z.string(),
  fileSize: z.number(),
  createdAt: z.number(),
});

export const materialListOutputSchema = z.array(materialOutputSchema);

export const uploadMaterialInputSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  caption: z.string().trim().max(300).optional().default(''),
  fileBase64: z.string().min(1).max(MAX_BASE64_CHARS),
});

export const removeMaterialInputSchema = z.object({
  id: z.uuid(),
});

export type MaterialOutput = z.infer<typeof materialOutputSchema>;
export type UploadMaterialInput = z.infer<typeof uploadMaterialInputSchema>;
export type RemoveMaterialInput = z.infer<typeof removeMaterialInputSchema>;
