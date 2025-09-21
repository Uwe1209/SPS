import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../component/Button';

export default function TestCamera() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [image, setImage] = useState(null);
    const cameraRef = useRef(null);
    const navigation = useNavigation();

    if (!permission) return <Text>Requesting camera permission...</Text>;
    if (!permission.granted) {
        return (
            <View style={styles.Box}>
                <Text style={{ color: 'white', textAlign: 'center' }}>No access to camera</Text>
                <CustomButton title="Grant permission" onPress={requestPermission} />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                console.log('captured', data);
                setImage(data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const savePicture = async () => {
        if (image?.uri) {
            try {
                await MediaLibrary.createAssetAsync(image.uri);
                alert('Picture saved! 🎉');
                setImage(null);
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            {!image ? (
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={styles.overlay} pointerEvents="box-none">
                        <View style={styles.topBar} pointerEvents="box-none">
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Entypo style={{ bottom: 5 }} name="cross" size={48} color="white" />
                            </TouchableOpacity>

                            {/* Flip camera button */}
                            <TouchableOpacity onPress={toggleCameraFacing}>
                                <Entypo name="cycle" size={36} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.topRow}>
                            <TouchableOpacity style={styles.smallButtonActive}>
                                <Text style={{ fontWeight: '900' }}>Identify</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.smallButtonInactive}>
                                <Text style={{ fontWeight: 'bold', color: 'white' }}>Multiple</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomRow}>
                            <TouchableOpacity onPress={() => navigation.navigate('testing')}>
                                <Ionicons name="images-outline" size={54} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.CaptureButton} onPress={takePicture} />

                            <TouchableOpacity onPress={() => navigation.navigate('identify_tips')}>
                                <MaterialIcons name="info-outline" size={54} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </CameraView>
            ) : (
                <ImageBackground source={{ uri: image.uri }} style={styles.camera}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.bottomRow}>
                            <CustomButton title={'Retake'} icon="retweet" onPress={() => setImage(null)} />
                            <CustomButton title={'Identify'} icon="check" onPress={savePicture} />
                        </View>
                    </View>
                </ImageBackground>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    Box: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    camera: { flex: 1, width: '100%', height: '100%' },
    topBar: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallButtonActive: {
        backgroundColor: 'white',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },
    smallButtonInactive: {
        backgroundColor: 'transparent',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 40,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 40,
    },
    CaptureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#B3B3B3',
        borderWidth: 6,
        borderColor: '#D9D9D9',
    },
    overlay: {
        flex: 1,
    },
});
