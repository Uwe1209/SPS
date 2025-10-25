import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { loginWithEmail, saveBiometric, loginWithGoogle, loginWithFacebook } from "../firebase/login_register/user_login";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import Recaptcha from "react-native-recaptcha-that-works";

WebBrowser.maybeCompleteAuthSession();

export default function UserLogin({navigation}){
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Recaptcha Setup
  const recaptchaRef = React.useRef();
  const [showCaptcha, setShowCaptcha] = React.useState(false);

  // your site key & base URL (registered in reCAPTCHA console)
  const SITE_KEY = "6LeViOkrAAAAAHFmBLtVJO5pc3VaeC6OINL3ThsB";   // from Google reCAPTCHA
  const BASE_URL = "https://smartplantsarawak.com";  // use your domain or localhost for testing

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: "521669272766-f7jvvkdvski00tt3t4u84b8hmgv2eehr.apps.googleusercontent.com",
    iosClientId: "521669272766-kusmfbsh1muk77326qhcok00bh80km1t.apps.googleusercontent.com",
    webClientId: "521669272766-ppbcskhou545io4ec701j844mmmu98oh.apps.googleusercontent.com",
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: "2896449453898976",
  });

  // Handle Google login
  React.useEffect(function() {
    if (googleResponse && googleResponse.type === "success") {
      var id_token = googleResponse.authentication.id_token;
      loginWithGoogle(id_token).then(function(res) {
        if (res.success) {
          Alert.alert("Success", "Welcome " + (res.user.displayName || "user"));
          navigation.navigate("Profile", { userEmail: res.user.email });
        } else {
          Alert.alert("Login Failed", res.error);
        }
      });
    }
  }, [googleResponse]);

  // Handle Facebook login
  React.useEffect(function() {
    if (fbResponse && fbResponse.type === "success") {
      var access_token = fbResponse.authentication.access_token;
      loginWithFacebook(access_token).then(function(res) {
        if (res.success) {
          Alert.alert("Success", "Welcome " + (res.user.displayName || "user"));
          navigation.navigate("Profile", { userEmail: res.user.email });
        } else {
          Alert.alert("Login Failed", res.error);
        }
      });
    }
  }, [fbResponse]);

  async function handleLogin() {
  
    const result = await loginWithEmail(email, password);

    if (!result.success) {
      Alert.alert("Error", result.error);
      return;
    }

    setShowCaptcha(true);
    setTimeout(function() {
      recaptchaRef.current.open();
    }, 500);
  }

  function onCaptchaSuccess(token) {
    setShowCaptcha(false);
    if (!token) {
      Alert.alert("Error", "reCAPTCHA failed. Please try again.");
      return;
    }

    saveBiometric(email).then(function(res) {
      if (res.success) {
        Alert.alert("Success", "Login successful!");
        navigation.navigate("Profile", { userEmail: email });
      } else {
        Alert.alert("Error", res.error);
      }
    });
  }

  function toSelection(){
    navigation.navigate("LoginSelection");
  }

  function toUserRegister(){
    navigation.navigate("UserRegister");
  }

  return(
    <ScrollView contentContainerStyle={styles.container}>
      {showCaptcha && (
          <Recaptcha style={styles.captcha} ref={recaptchaRef} siteKey={SITE_KEY} baseUrl={BASE_URL} onVerify={onCaptchaSuccess} size="normal" theme="light" retryInterval={3000}></Recaptcha>
      )}

      <TouchableOpacity onPress={toSelection}>
        <Image style={styles.backlogo} source={require('../../assets/backlogo.png')}></Image>
      </TouchableOpacity>

      <Image style={styles.logo_login1} source={require('../../assets/applogo.png')} alt="Logo"></Image>

      <View style={styles.login_container1}>
        <View style={styles.login_container_text}>
          <Text style={styles.login_title}>Welcome Back</Text>
        </View>

        <View>
          <Text style={styles.input_label}>Email</Text>
          <TextInput style={styles.input_textinput} placeholder="john@example.com" onChangeText={(text) => setEmail(text)}></TextInput>
        </View>

        <View>
          <Text style={styles.input_label}>Password</Text>
          <TextInput style={styles.input_textinput} placeholder="********" secureTextEntry={true} onChangeText={(text) => setPassword(text)}></TextInput>
        </View>

        <View style={styles.row}>
          <Text style={styles.text1}>Remember Me</Text>
          <Text style={styles.link1}>Forget Password</Text>
        </View>

        <View style={styles.button_login_container}>
          <TouchableOpacity style={styles.button_login} onPress={handleLogin}>
            <Text style={styles.button_text}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>  

      <Text style={styles.text_OR}>OR</Text>

      <View style={styles.login_method_container}>
        <TouchableOpacity style={styles.login_method} onPress={() => googlePromptAsync()}>
          <Text style={styles.login_method_text}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.login_method} onPress={() => fbPromptAsync()}>
          <Text style={styles.login_method_text}>Facebook</Text>
        </TouchableOpacity>
      </View>

        <Text style={styles.text2}>Don't have an account? <Text style={styles.link2} onPress={toUserRegister}>Sign Up</Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Login Selection Page
  logo: {
    width: 100,
    height: 100,
    marginBottom: 18,
    borderRadius: 50,
  },

  logo_caption: {
    fontWeight: 'bold',
    fontSize: 17,
  },

  touchid: {
    width: 85,
    height: 85,
    margin: 15,
  },

  button_container: {
    marginTop: 110,
    flexDirection: 'row',
  },

  button_text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
  },

  button_selection: {
    backgroundColor: '#578C5B',
    padding: 15,
    marginVertical: 10,
    borderRadius: 20,
    width: 150,
    marginHorizontal: 7,
  },

  quicklogin_text1: {
    marginTop: 60,
    fontWeight: 'bold',
    fontSize: 17,
    color: '#344d36ff',
  },

  quicklogin_text2: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },

  // User Login Page & Admin Login Page
  backlogo: {
    width: 40,
    height: 40,
    bottom: 70,
    right: 165,
  },

  backlogo1: {
    width: 40,
    height: 40,
    bottom: 95,
    right: 165,
  },

  backlogo2: {
    width: 40,
    height: 40,
    bottom: 168,
    right: 165,
  },

  back_selction: {
    marginTop: 40,
    marginLeft: 10,
    fontSize: 17,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 10,
  },

  logo_login1:{
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: 50,
    backgroundColor: "rgba(255, 255, 255, 0.49)", 
    shadowColor: "#366728ff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8, // for Android
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",  
  },

  login_container1: {
    backgroundColor: '#578C5B',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#143d17ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  login_container_text: {
    alignItems: 'center',
  },

  login_title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },

  input_label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },

  input_textinput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    marginTop: 5,
  },

  text1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  text2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },

  link1: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },

  link2: {
    color: '#344d36ff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  button_login_container: {
    alignItems: 'center',
  },

  button_login: {
    backgroundColor: '#496D4C',
    padding: 10,
    borderRadius: 10,
    width: '60%',
    marginVertical: 10,
  },

  text_OR: {
    fontSize: 22,
    marginTop: 25,
    marginBottom: 25,
    fontWeight: 'bold',
  },

  login_method_container: {
    backgroundColor: '#578C5B',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#143d17ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: 'row',
  },

  login_method: {
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    alignItems: 'center',
    width: '40%',
  },

  login_method_text: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  text_agreement: {
    fontSize: 15,
    color: '#fff',
    alignItems: 'center',
  },

  text_agreement_container: {
    alignItems: 'center',
  },

  captcha: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.5)", 
    padding: 20,
  }
});
