import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";

export default function Introduction({navigation}) {
  function toSelection(){
    navigation.navigate("LoginSelection");
  }

  return (
    <LinearGradient colors={["#def881ff", "#3f6f12ff"]} style={styles.container}>
      <Swiper loop={false} dot={<View style={styles.dot}></View>} activeDot={<View style={styles.active_dot}></View>}>

        <View style={styles.slide}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.title}>Sarawak's Biodiversity</Text>

          <View style={styles.small_container}>
            <Text style={styles.small_text}>Bought to you by</Text>
            <View style={styles.icon_container}>
              <Image source={require("../../assets/neuonai.png")} style={styles.icon} resizeMode="contain" />
              <Image source={require("../../assets/sarawakforest.png")} style={styles.icon} resizeMode="contain" />
            </View>
          </View>
        </View>

        <View style={styles.slide}>
          <Text style={styles.title}>Identify</Text>
          <Text style={styles.title}>Plants Instantly</Text>

          <View style={styles.small_container}>
            <Text style={styles.small_text}>Powered by</Text>
            <Image source={require("../../assets/aichip.png")} style={styles.icon} resizeMode="contain"></Image>
          </View>
        </View>

        <View style={styles.slide}>
          <Image source={require("../../assets/sarawakstate.png")} style={styles.state_image} resizeMode="contain"></Image>
          <Text style={styles.title3}>Protect</Text>
          <Text style={styles.title3}>Natural Heritage</Text>

          <View style={styles.small_container2}>
            <TouchableOpacity style={styles.button_intro} onPress={toSelection}>
              <Text style={styles.button_intro_text}>Let's Go</Text>
            </TouchableOpacity>
            <Text style={styles.tap_text}>Tap to begin</Text>
          </View>
        </View>
      </Swiper>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  title3: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    bottom: 60,
  },

  small_container: {
    top: 200,
  },

  small_container2: {
    top: 80,
    alignItems: 'center',
  },

  small_text: {
    fontSize: 17,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  icon_container: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 150,
    height: 150, 
  },

  state_image: {
    width: 320,
    height: 320,
    bottom: 80,
  },

  button_intro: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },

  button_intro_text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },

  tap_text: {
    color: "#fff",
    marginTop: 10,
    fontSize: 17,
    fontWeight: "bold",
  },

  dot: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },

  active_dot: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },
});
