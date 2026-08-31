import { trpc } from "./trpc";

export interface CourseContentItem {
  id: string;
  type: "video" | "image";
  url: string;
  caption: string;
}

// Plain request-response, not a realtime subscription like the old
// Firestore onSnapshot listener - callers (CoursePage) refetch after a
// successful add/remove instead of waiting on a push update.
export async function listCourseContent(): Promise<CourseContentItem[]> {
  return trpc.courseContent.list.query();
}

export async function addCourseItem(item: { type: "video" | "image"; url: string; caption: string }) {
  await trpc.courseContent.add.mutate(item);
}

export async function deleteCourseItem(id: string) {
  await trpc.courseContent.remove.mutate({ id });
}

// Converts common YouTube URL formats into an embeddable iframe src.
// Falls back to the original URL for direct video files (e.g. .mp4).
export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [/youtu\.be\/([\w-]{11})/, /youtube\.com\/watch\?v=([\w-]{11})/, /youtube\.com\/embed\/([\w-]{11})/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}
