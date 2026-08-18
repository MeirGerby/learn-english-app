import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const courseCollection = collection(db, "courseContent");

export function subscribeToCourseContent(
  onChange: (items: { id: string; type: "video" | "image"; url: string; caption: string }[]) => void
) {
  const q = query(courseCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    onChange(
      snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return { id: docSnap.id, type: data.type, url: data.url, caption: data.caption };
      })
    );
  });
}

export async function addCourseItem(item: { type: "video" | "image"; url: string; caption: string }) {
  await addDoc(courseCollection, { ...item, createdAt: serverTimestamp() });
}

export async function deleteCourseItem(id: string) {
  await deleteDoc(doc(db, "courseContent", id));
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
