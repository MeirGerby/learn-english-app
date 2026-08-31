import { trpc } from "./trpc";
import { getAuthToken } from "./authToken";

export interface MaterialItem {
  id: string;
  filename: string;
  caption: string;
  fileSize: number;
  createdAt: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function listMaterials(): Promise<MaterialItem[]> {
  return trpc.materials.list.query();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // FileReader's data URL is "data:<mime>;base64,<data>" - strip the
      // prefix, the API only wants the raw base64 payload.
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadMaterial(file: File, caption: string): Promise<MaterialItem> {
  const fileBase64 = await fileToBase64(file);
  return trpc.materials.upload.mutate({ filename: file.name, caption, fileBase64 });
}

export async function deleteMaterial(id: string) {
  await trpc.materials.remove.mutate({ id });
}

// A plain REST URL (with the JWT as a query param, since a browser
// navigation/embed doesn't attach the localStorage-held token as an
// Authorization header the way the tRPC client does) - not a tRPC call,
// so the PDF can be opened/downloaded directly by the browser.
export function getMaterialFileUrl(id: string): string {
  const token = getAuthToken() ?? "";
  return `${API_URL}/materials/${id}/file?token=${encodeURIComponent(token)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
