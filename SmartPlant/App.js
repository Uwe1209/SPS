import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import IdentifyPage from './src/pages/identify';
import IdentifyTips from './src/pages/identify_tips';
import IdentifyOutput from './src/pages/identify_output';
import Profile from "./src/pages/Profile";
import MyProfile from "./src/pages/Myprofile";
import EditProfile from "./src/pages/EditProfile";
import Setting from "./src/pages/Setting";
import Saved from "./src/pages/Saved";
import NotificationUser from "./src/pages/NotificationUser";
import NotificationExpert from "./src/pages/NotificationExpert";
import MapPage from "./src/pages/MapPage";

import LoginSelection from "./src/pages/LoginSelection";
import UserLogin from "./src/pages/UserLogin";
import UserRegister from "./src/pages/UserRegister";
import AdminLogin from "./src/pages/AdminLogin";

import HomepageExpert from "./src/pages/HomepageExpert";
import HomepageUser from "./src/pages/HomepageUser";
import PlantDetailUser from "./src/pages/PlantDetailUser";
import PlantManagementDetail from "./src/pages/PlantManagementDetail";
import PlantManagementList from "./src/pages/PlantManagementList";
import PostDetail from "./src/pages/PostDetail";
import ReportError from "./src/pages/ReportError";
import TopSuggestions from "./src/pages/TopSuggestions";
import CreatePost from "./src/pages/CreatePost";
import AdminNavigator from './src/admin/AdminNavigator';
import IoTDashboard from './src/pages/iot_dashboard';
import FlashMessage, { showMessage } from "react-native-flash-message";

//testing the component
import Testing from './src/pages/testing';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="identify" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Testing" component={Testing} />
        <Stack.Screen name="Profile" component={Profile} />
        {/* <Stack.Screen name="IoTDashboard" component={IoTDashboard} /> */}
        {/* <Stack.Screen name="DashboardScreen" component={DashboardScreen} /> */}
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />

        <Stack.Screen name="MapPage" component={MapPage} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Saved" component={Saved} />
        <Stack.Screen name="NotificationUser" component={NotificationUser} />
        <Stack.Screen name="NotificationExpert" component={NotificationExpert} />
        <Stack.Screen name="identify" component={IdentifyPage} />
        <Stack.Screen name="identify_tips" component={IdentifyTips} />
        <Stack.Screen name="identify_output" component={IdentifyOutput}/>

        <Stack.Screen name="LoginSelection" component={LoginSelection} />
        <Stack.Screen name="UserLogin" component={UserLogin} />
        <Stack.Screen name="UserRegister" component={UserRegister} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />

        <Stack.Screen name="HomepageExpert" component={HomepageExpert}/>
        <Stack.Screen name="HomepageUser" component={HomepageUser}/>
        <Stack.Screen name="PlantDetailUser" component={PlantDetailUser}/>
        <Stack.Screen name="PlantManagementDetail" component={PlantManagementDetail}/>
        <Stack.Screen name="PlantManagementList" component={PlantManagementList}/>
        <Stack.Screen name="PostDetail" component={PostDetail}/>
        <Stack.Screen name="ReportError" component={ReportError}/>
        <Stack.Screen name="TopSuggestions" component={TopSuggestions}/>
        <Stack.Screen name="CreatePost" component={CreatePost}/>
        <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
    <FlashMessage position="top" />
    </>
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
