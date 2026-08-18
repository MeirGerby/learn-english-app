// Firebase project config. This is safe to be public - it identifies the
// project, it does not grant access by itself. Real access control is
// enforced server-side by Firestore Security Rules (see ADMIN_EMAILS,
// which must match the rules configured in the Firebase console).
import { initializeApp } from "firebase/app";
import { getAuth, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgkkp3zTZ2rTTVcn6NtGProxnDuXppZpY",
  authDomain: "learn-english-app-82201.firebaseapp.com",
  projectId: "learn-english-app-82201",
  storageBucket: "learn-english-app-82201.firebasestorage.app",
  messagingSenderId: "360286588952",
  appId: "1:360286588952:web:acfd5d28fd9e81279fb36d",
};

export const ADMIN_EMAILS = ["meirg2001@gmail.com", "hodayashalom1@gmail.com"];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isAdmin(user: User | null | undefined): boolean {
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
}
