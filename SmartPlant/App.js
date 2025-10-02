import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "./src/pages/profile";
import MyProfile from "./src/pages/myprofile";
import Setting from "./src/pages/setting";
import Saved from "./src/pages/saved";

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


