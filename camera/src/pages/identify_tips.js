import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function IdentificationTips({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Identification Tips</Text>
      <Text style={styles.subtitle}>
        Create spaces where you can position and grow your plants
      </Text>

      {/* Big Circle */}
      <View style={styles.bigCircle} />

      {/* Three Small Circles with labels */}
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={styles.smallCircle} />
          <Text style={styles.label}>Too Close</Text>
        </View>
        <View style={styles.item}>
          <View style={styles.smallCircle} />
          <Text style={styles.label}>Too Far</Text>
        </View>
        <View style={styles.item}>
          <View style={styles.smallCircle} />
          <Text style={styles.label}>Multi-species</Text>
        </View>
      </View>

      {/* Done button */}
      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B', // dark gray background
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B3B3B3',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#B3B3B3',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: 'white',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 30,
  },
  doneText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
