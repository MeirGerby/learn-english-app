import { trpcClient } from '../../../lib/trpc';

export interface CourseContentItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  caption: string;
}

export async function addCourseItem(item: {
  type: 'video' | 'image';
  url: string;
  caption: string;
}) {
  await trpcClient.courseContent.add.mutate(item);
}

export async function deleteCourseItem(id: string) {
  await trpcClient.courseContent.remove.mutate({ id });
}

// Converts common YouTube URL formats into an embeddable iframe src.
// Falls back to the original URL for direct video files (e.g. .mp4).
export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}
