<<<<<<< HEAD
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
=======
import { collection, addDoc } from 'firebase/firestore';
>>>>>>> 217dbb287f57b9f55efba5ef5a9d47b2c1115ead
import { db } from '../FirebaseConfig';

export const addPlantIdentify = async (plantData) => {
  try {
<<<<<<< HEAD
    const docRef = await addDoc(collection(db, 'plant_identify'), {
      ...plantData,
      createdAt: serverTimestamp(),
    });
    console.log('Document written with ID:', docRef.id);
=======
    const docRef = await addDoc(collection(db, 'plant_identify'), plantData);
    
>>>>>>> 217dbb287f57b9f55efba5ef5a9d47b2c1115ead
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};
