// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABa3u5MFTYVdM1drHsSbvBIZPmo0REhNs",
  authDomain: "smartplantsarawak.firebaseapp.com",
  projectId: "smartplantsarawak",
  storageBucket: "smartplantsarawak.firebasestorage.app",
  messagingSenderId: "521669272766",
  appId: "1:521669272766:web:2fedb25781a790f7c0eaef",
  measurementId: "G-R6C6WXGMV9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
