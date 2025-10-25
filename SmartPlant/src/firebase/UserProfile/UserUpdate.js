import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export const getFullProfile = async (email) => {
  try {
    // Query user by email field
    const q = query(collection(db, "user"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("User document not found for email:", email);
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log("User data:", userData);

    // Query account using user_id
    const accountQuery = query(
      collection(db, "account"),
      where("user_id", "==", userData.user_id)
    );

    const accountSnap = await getDocs(accountQuery);

    let accountData = {};
    accountSnap.forEach((doc) => {
      accountData = doc.data(); // assuming one account per user
    });

    console.log("Account data:", accountData);

    // Merge and return
    return { user_id: userData.user_id, ...userData, ...accountData };

  } catch (error) {
    console.error("Error fetching full profile:", error);
    return null;
  }
};




