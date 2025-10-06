import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from "react-native";

export default function SettingsScreen({ navigation }) {
  const [location, setLocation] = useState(false);
  const [camera, setCamera] = useState(false);
  const [photos, setPhotos] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.row}>
        <Image
            source={require("../../assets/language.png")} 
            style={styles.icon}
        />
        <Text style={styles.text}>Choose Language: English</Text>
      </View>

      <View style={styles.row}>
        <Image
            source={require("../../assets/location.png")} 
            style={styles.icon}
        />
        <Text style={styles.text}>Location</Text>
        <Switch style={styles.switch} value={location} onValueChange={setLocation} trackColor={{ false: "white", true: "#496D4C" }}
        thumbColor={photos ? "#496D4C" : "#496D4C"}/>
      </View>

      <View style={styles.row}>
        <Image
            source={require("../../assets/camera.png")} 
            style={styles.icon}
        />
        <Text style={styles.text}>Camera</Text>
        <Switch style={styles.switch} value={camera} onValueChange={setCamera} trackColor={{ false: "white", true: "#496D4C" }}
        thumbColor={photos ? "#496D4C" : "#496D4C"}/>
      </View>

      <View style={styles.row}>
        <Image
            source={require("../../assets/photos.png")} 
            style={styles.icon}
        />
        <Text style={styles.text}>Photos</Text>
        <Switch style={styles.switch} value={photos} onValueChange={setPhotos} trackColor={{ false: "white", true: "#496D4C" }}
        thumbColor={photos ? "#496D4C" : "#496D4C"}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: "#fefae0", 
      paddingHorizontal: "5%",
      padding: 20 
  },
  header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
  },
  back: { 
      fontSize: 22,
      marginRight: 10,
      marginTop: 30,
  },
  title: { 
      fontSize: 20, 
      flex: 1,
      textAlign: "center",
  },
  row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 15,
  },
  icon: {
      width: 50,
      height: 50,
      marginRight: 15,
      resizeMode: "contain",
  },
  text: {
      fontSize: 16,
      flex: 1,
  },
  switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], 
  },
});
