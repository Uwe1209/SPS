import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../FirebaseConfig';
import * as FileSystem from 'expo-file-system'; // only if using Expo

export const uploadImage = async (uri, plant_name) => {
  try {
    // Convert local image file to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference in Storage
    const filename = `plant_images/${plant_name}_${Date.now()}.jpg`;
    const imageRef = ref(storage, filename);

    // Upload blob to Firebase Storage
    await uploadBytes(imageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
