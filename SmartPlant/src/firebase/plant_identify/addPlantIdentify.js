import { collection, addDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

export const addPlantIdentify = async (plantData) => {
  try {
    const docRef = await addDoc(collection(db, 'plant_identify'), plantData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};
