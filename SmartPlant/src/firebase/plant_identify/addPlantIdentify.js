import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

export const addPlantIdentify = async (plantData) => {
  try {
    const docRef = await addDoc(collection(db, 'plant_identify'), {
      ...plantData,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};
