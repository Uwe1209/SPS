import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";

/**
 * addNotification({ userId, type, title, message, payload? })
 * type: 'plant_identified' | 'post_like' | 'post_comment' | 'admin_reply'
 */
export async function addNotification({ userId, type, title, message, payload = {} }) {
  if (!userId) throw new Error("userId is required");
  return addDoc(collection(db, "notifications"), {
    userId,
    type,
    title,
    message,
    payload,
    read: false,
    createdAt: serverTimestamp(),
  });
}
