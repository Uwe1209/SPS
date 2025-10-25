import { doc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export function markNotificationRead(id) {
  return updateDoc(doc(db, "notifications", id), { read: true });
}
