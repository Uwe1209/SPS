import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { user_register } from '../firebase/login_register/user_register.js';
import { Alert } from "react-native";

export default function UserRegister({navigation}){
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  async function handleRegister() {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await user_register(fullName, email, password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: function () { navigation.navigate("UserLogin"); } }
      ]);
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  }

  function toUserLogin() {
    navigation.navigate("UserLogin");
  }

  return(
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={toUserLogin}>
        <Image style={styles.backlogo1} source={require('../../assets/backlogo.png')}></Image>
      </TouchableOpacity>

      <Image style={styles.logo_login} source={require('../../assets/test.jpg')} alt="Logo"></Image>

      <View style={styles.login_container}>
        <View style={styles.login_container_text}>
          <Text style={styles.login_title}>Create Your Account</Text>
        </View>

        <View>
          <Text style={styles.input_label}>Full Name</Text>
          <TextInput style={styles.input_textinput} placeholder="John Doe" onChangeText={setFullName}></TextInput>
        </View>

        <View>
          <Text style={styles.input_label}>Email</Text>
          <TextInput style={styles.input_textinput} placeholder="john@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none"></TextInput>
        </View>
        
        <View>
          <Text style={styles.input_label}>Password</Text>
          <TextInput style={styles.input_textinput} placeholder="Password" secureTextEntry={true} value={password} onChangeText={setPassword}></TextInput>
        </View>

        <View>
          <Text style={styles.input_label}>Confirm Password</Text>
          <TextInput style={styles.input_textinput} placeholder="Confirm Password" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword}></TextInput>
        </View>
        
        <View style={styles.text_agreement_container}>
          <Text style={styles.text_agreement}>
            I agree to the Terms of Condition and Privacy Policy
          </Text>
        </View>

        <View style={styles.button_login_container}>
          <TouchableOpacity style={styles.button_login} onPress={handleRegister}>
            <Text style={styles.button_text}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  // User Login Page & Admin Register Page
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

  logo_login:{
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: 50,
  },

  login_container: {
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
});
