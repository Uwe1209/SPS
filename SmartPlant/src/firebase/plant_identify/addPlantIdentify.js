import firestore from '@react-native-firebase/firestore';

export const addPlantIdentify = async (plantData) => {
  try {
    const docRef = await firestore()
      .collection('plant_identify')
      .add({
        ...plantData,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};
