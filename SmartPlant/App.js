import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import IdentifyPage from './src/pages/identify';
import IdentifyTips from './src/pages/identify_tips';
import IdentifyOutput from './src/pages/identify_output';
import Profile from "./src/pages/Profile";
import MyProfile from "./src/pages/Myprofile";
import Setting from "./src/pages/Setting";
import Saved from "./src/pages/Saved";
import Notification from "./src/pages/Notification";
import MapPage from "./src/pages/MapPage";
import LoginSelection from "./src/pages/LoginSelection";
import UserLogin from "./src/pages/UserLogin";
import UserRegister from "./src/pages/UserRegister";
import AdminLogin from "./src/pages/AdminLogin";


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Profile" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="MapPage" component={MapPage} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Saved" component={Saved} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="identify" component={IdentifyPage} />
        <Stack.Screen name="identify_tips" component={IdentifyTips} />
        <Stack.Screen name="identify_output" component={IdentifyOutput}/>
        <Stack.Screen name="LoginSelection" component={LoginSelection} />
        <Stack.Screen name="UserLogin" component={UserLogin} />
        <Stack.Screen name="UserRegister" component={UserRegister} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
