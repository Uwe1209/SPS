import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from "expo-image-picker";
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNav from "../components/Navigation";

import CustomButton from '../components/Button';

export default function IdentifyPage() {
    const [permission, requestPermission] = useCameraPermissions();
    const [images, setImages] = useState([]);
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const route = useRoute();
    const { mode } = route.params || { mode: "single" }; // default single
    const [facing, setFacing] = useState("back");
    //prediction variable
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);


    //Reset images when switching modes
    useEffect(() => {
        setImages([]);
    }, [mode]);


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



    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                if (mode === "single") {
                    setImages([data.uri]); // replace
                } else {

                    if (images.length >= 3) {
                        alert("Maximum 3 images allowed!");
                        return images;
                    }


                    setImages((prev) => [...prev, data.uri]); // append
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied! You need to allow access to photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            setImages((prev) => {
                if (prev.length >= 3) {
                    alert("Maximum 3 images allowed!");
                    return prev;
                }
                return [...prev, newUri];
            });
        }
    };

    const removeImage = (uri) => {
        setImages((prev) => prev.filter((img) => img !== uri));
    };


    //prediction 
    const identifyImage = async () => {
        if (images.length === 0) {
            alert("Please capture or pick an image first");
            return;
        }

        let formData = new FormData();
        formData.append("image", {
            uri: images[0],   // single mode
            type: "image/jpeg",
            name: "photo.jpg",
        });

        try {
            setLoading(true);
            const response = await fetch("http://10.69.215.149:3000/predict", {

                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
                body: formData,
            });

            const data = await response.json();
            setLoading(false);

            // Navigate to output page with prediction
            navigation.navigate("identify_output", { prediction: data, imageURI: images[0] });
        } catch (err) {
            console.log("Upload error:", err);
            alert("Failed to identify. Check backend connection.");
        }
    };

    return (

        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00ff3cff" />
                    <Text style={{ color: "white", marginTop: 10 }}>Identifying...</Text>
                </View>
            )}

            {/* Camera */}
            {images.length === 0 || mode === "multiple" ? (
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={styles.overlay} pointerEvents="box-none">
                        <View style={styles.topBar}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Entypo name="cross" size={48} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleCameraFacing}>
                                <Entypo name="cycle" size={36} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        {/* Multiple mode preview row */}
                        {mode === "multiple" && images.length > 0 && (

                            <ScrollView horizontal contentContainerStyle={styles.previewRow}>
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.card}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => removeImage(uri)}
                                        >
                                            <Text style={{ color: "white", fontWeight: "bold" }}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                        )}
                        {/* Mode buttons */}
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                style={[styles.smallButton, mode === "single" ? styles.active : styles.inactive]}
                                onPress={() => navigation.navigate("identify", { mode: "single" })}
                            >
                                <Text style={{ fontWeight: '900', color: mode === "single" ? "black" : "white" }}>Identify</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.smallButton, mode === "multiple" ? styles.active : styles.inactive]}
                                onPress={() => navigation.navigate("identify", { mode: "multiple" })}
                            >
                                <Text style={{ fontWeight: '900', color: mode === "multiple" ? "black" : "white" }}>Multiple</Text>
                            </TouchableOpacity>
                        </View>


                        {/* Bottom controls */}
                        {images.length === 3 ? (
                            <View style={styles.bottomRow}>
                                <TouchableOpacity style={styles.identifyButton}>
                                    <Text style={{ fontWeight: '900', color: 'white', textAlign: 'center' }}>Identify</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.bottomRow}>
                                <TouchableOpacity onPress={pickImage}>
                                    <Ionicons name="images-outline" size={54} color='white' />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.CaptureButton} onPress={takePicture} />
                                <TouchableOpacity onPress={() => navigation.navigate("identify_tips")}>
                                    <MaterialIcons name="info-outline" size={54} color='white' />
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>
                </CameraView>
            ) : (
                // Single image preview mode
                <ImageBackground source={{ uri: images[0] }} style={styles.camera} imageStyle={styles.previewImage}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.bottomRow}>
                            <CustomButton title={'Retake'} icon="retweet" onPress={() => setImages([])} />
                            <CustomButton title={'Identify'} icon="check" onPress={identifyImage} />
                        </View>
                    </View>
                </ImageBackground>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
    },

    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    Box: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
        alignItems: 'center'
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%'

    },
    previewImage: {
        resizeMode: 'contain', // keeps aspect ratio 
        width: '100%',
        height: '100%',
    },
    topBar: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallButton: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12
    },
    active: {
        backgroundColor: 'white'
    },
    inactive: {
        backgroundColor: 'transparent'
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 20
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 40
    },
    CaptureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#B3B3B3',
        borderWidth: 10,
        borderColor: '#D9D9D9',
    },
    overlay: {
        flex: 1,
    },
    card: {
        position: "relative",
        marginLeft: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    deleteButton: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    previewRow: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    identifyButton: {
        backgroundColor: 'green',
        width: "65%",
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 12
    },
});
