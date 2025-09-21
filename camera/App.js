import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import IdentifyPage from './src/pages/identify';
import IdentifyTips from './src/pages/identify_tips';
import IdentifyOutput from './src/pages/identify_output';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="identify">
          <Stack.Screen name="identify" component={IdentifyPage}  options={{ headerShown: false }}  />
          <Stack.Screen name="identify_tips" component={IdentifyTips}  options={{ headerShown: false }}  />
          <Stack.Screen name="identify_output" component={IdentifyOutput}  options={{ headerShown: false }}  />
         

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
