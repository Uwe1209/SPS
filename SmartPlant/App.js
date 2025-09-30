import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "./profile";
import MyProfile from "./myprofile";
import Setting from "./setting";
import Saved from "./saved";
import Notification from "./Notification";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Profile" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Saved" component={Saved} />
        <Stack.Screen name="Notification" component={Notification} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


