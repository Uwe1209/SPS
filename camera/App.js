import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons,Ionicons} from '@expo/vector-icons';
import CustomButton from './src/component/Button';



export default function TestCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.Box}>
        <Text style={{ color: 'white', textAlign: 'center' }}>No access to camera</Text>
        <CustomButton title="Grant permission" onPress={() => requestPermission()} />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        alert('Picture saved! 🎉');
        setImage(null);
        console.log('saved successfully');
      } catch (error) {
        console.log(error);
      }
    }
  };




  return (
    <View style={styles.container}>
      {!image ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.buttonAlign}>
            <Ionicons name="images-outline" size={54} color='white'/>
            <CustomButton title={'Take a picture'} icon="camera" onPress={takePicture} />
            <MaterialIcons name="info-outline" size={54} color='white'/>
          </View>
        </CameraView>
      ) : (
        <ImageBackground source={{ uri: image }} style={styles.camera}>
          <View style={styles.buttonAlign}>
            <CustomButton title={'Retake'} icon="retweet" onPress={() => setImage(null)} />
            <CustomButton title={'Identify'} icon="check" onPress={savePicture} />
          </View>
        </ImageBackground>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  Box: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',  
    height: '100%', 
  },
  buttonAlign: {
    position: 'absolute', 
    bottom: 40,              
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding:8,
    },


});