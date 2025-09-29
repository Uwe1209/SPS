import { View, TouchableOpacity, StyleSheet, Text } from "react-native";

export default function SavedScreen({ navigation }) {
  const colors = ["#D96D63", "#446C47", "#8FCF6F", "#E0F474", "#517B53", "#AAAAAA", "#94D27A", "#444444"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.settings}>...</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {colors.map((c, i) => (
          <View key={i} style={[styles.box, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: "#fefae0" 
  },
  header: {   
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 15,
      alignItems: "center",
  },
  back: {
      fontSize: 22,
      marginRight: 10,
      marginTop: 30,
  },
  title: { 
      fontSize: 18, 
      textAlign: "center",
      width: "80%",
      marginTop: 30,
  },
  settings: { 
      fontSize: 20,
      position: "absolute",
      right: 5, 
  },
  grid: {
      flexDirection: "row",
      flexWrap: "wrap",
  },
  box: {
      width: 120,
      height: 120,
      borderWidth: 1,
      borderColor: "white",
  },
});
