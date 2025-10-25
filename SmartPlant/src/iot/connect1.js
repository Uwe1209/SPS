import React from 'react';
import { View, Button, Alert } from 'react-native';

export default function connect1() {
  const ESP8266_IP = 'http://192.168.50.88'; // replace with your ESP8266 IP

  const turnOnLED = async () => {
    try {
      const res = await fetch(`${ESP8266_IP}/led/on`);
      const text = await res.text();
      Alert.alert(text);
    } catch (e) {
      Alert.alert('Error connecting to ESP8266');
    }
  };

  const turnOffLED = async () => {
    try {
      const res = await fetch(`${ESP8266_IP}/led/off`);
      const text = await res.text();
      Alert.alert(text);
    } catch (e) {
      Alert.alert('Error connecting to ESP8266');
    }
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Turn LED ON" onPress={turnOnLED} />
      <View style={{ height: 20 }} />
      <Button title="Turn LED OFF" onPress={turnOffLED} />
    </View>
  );
}