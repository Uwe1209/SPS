import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function IdentificationTips({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Identification Tips</Text>
      <Text style={styles.subtitle}>
        Create spaces where you can position and grow your plants
      </Text>

      {/* Correct image (big circle) */}
      <Image
        source={require('../../assets/good.jpg')}
        style={styles.bigCircle}
      />

      {/* Three small images with labels */}
      <View style={styles.row}>
        <View style={styles.item}>
          <Image
            s source={require('../../assets/too_close.jpg')}
            style={styles.smallCircle}
          />
          <Text style={styles.label}>Too Close</Text>
        </View>
        <View style={styles.item}>
          <Image
             source={require('../../assets/too_far.jpeg')} 
            style={styles.smallCircle}
          />
          <Text style={styles.label}>Too Far</Text>
        </View>
        <View style={styles.item}>
          <Image
             source={require('../../assets/multi_species.jpeg')}
            style={styles.smallCircle}
          />
          <Text style={styles.label}>Multi-species</Text>
        </View>
      </View>

      {/* Done button */}
      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B', //lazy to do gradient
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  bigCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  item: {
    alignItems: 'center',
  },
  smallCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: 'white',
  },
  doneButton: {
    backgroundColor: "#496D4C",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginBottom: 30,
  },
});
