import { auth, db } from "../FirebaseConfig";
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loginWithEmail(email, password) {
  if (!email || !password) {
    return { success: false, error: "Please enter email and password" };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let message;
    switch (error.code) {
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Incorrect password. Please try again.";
        break;
      case "auth/user-not-found":
        message = "No account found with this email.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection.";
        break;
      default:
        message = error.message;
    }
    return { success: false, error: message };
  }
}

export async function saveBiometric(email) {
  try {
    await AsyncStorage.setItem("savedEmail", email);
    await AsyncStorage.setItem("biometricEnabled", "true");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function saveCredentials(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: "Missing email or password." };
    }

    await AsyncStorage.setItem("savedEmail", email);
    await AsyncStorage.setItem("savedPassword", password);
    await AsyncStorage.setItem("biometricEnabled", "true");

    // 🔹 Confirm saved items
    const check = await AsyncStorage.getItem("biometricEnabled");
    console.log("Biometric flag saved:", check);

    return { success: true };
  } catch (e) {
    console.log("Error saving credentials:", e);
    return { success: false, error: e.message };
  }
}

export async function loginWithGoogle(id_token) {
  try {
    const credential = GoogleAuthProvider.credential(id_token);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Save user data in Firestore
    await setDoc(doc(db, "user", user.uid), {
      email: user.email || "",
      full_name: user.displayName || "",
      login_method: "google",
      provider_id: user.uid,
      is_active: true,
      password: "",
      role: "",
      created_at: serverTimestamp(),
    }, { merge: true });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginWithFacebook(access_token) {
  try {
    const credential = FacebookAuthProvider.credential(access_token);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Save user data in Firestore
    await setDoc(doc(db, "user", user.uid), {
      email: user.email || "",
      full_name: user.displayName || "",
      login_method: "facebook",
      provider_id: user.uid,
      is_active: true,
      password: "",
      role: "",
      created_at: serverTimestamp(),
    }, { merge: true });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
