import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { storage, db } from "../FirebaseConfig";

// Upload profile image
export const uploadProfilePicture = async (uri, email) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profile_pictures/${email}_${Date.now()}.jpg`;
    const imageRef = ref(storage, filename);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Validate profile info
export const validateProfileData = (data) => {
  if (!data.name) return "Name is required.";
  if (!data.phone) return "Phone number is required.";
  return null;
};

export const updateUserProfile = async (email, data) => {
  // Update user collection
  const userQuery = query(collection(db, "user"), where("email", "==", email));
  const userSnap = await getDocs(userQuery);
  if (!userSnap.empty) {
    const userDocId = userSnap.docs[0].id;
    await setDoc(doc(db, "user", userDocId), {
      full_name: data.full_name,
      password: data.password
    }, { merge: true });
  }

  // Update account collection
  const accountQuery = query(collection(db, "account"), where("user_id", "==", data.user_id));
  const accountSnap = await getDocs(accountQuery);
  if (!accountSnap.empty) {
    const accountDocId = accountSnap.docs[0].id;
    await setDoc(doc(db, "account", accountDocId), {
      ...data,
      profile_pic: data.profile_pic || null,  
    }, { merge: true });
  }
};