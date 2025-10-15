import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function user_register(fullName, email, password) {
  try {
    // 1. Firebase Authentication - Create User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // 2. Firestore - Store in "users" table
    await setDoc(doc(db, "user", userId), {
      user_id: userId,
      full_name: fullName,
      email: email,
      password: password, // If you want security, better not store this openly
      login_method: "manual",
      provider_id: null,
      role: "user",
      is_active: true,
      created_at: serverTimestamp(),
    });

    // 3. Firestore - Create empty profile in "account" table
    await setDoc(doc(db, "account", userId), {
      account_id: userId,
      user_id: userId,
      profile_pic: null,
      phone_number: null,
      date_of_birth: null,
      nric: null,
      gender: null,
      address: null,
      division: null,
      postcode: null,
      race: null,
      occupation: null,
      created_at: serverTimestamp(),
    });

    return true; // ✅ Return to confirm success
  } catch (error) {
    throw error; // ❌ Send error back to UI
  }
}
