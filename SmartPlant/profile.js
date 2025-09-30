import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from '@expo/vector-icons'; // for icons

export default function ProfileScreen({ navigation }) {   
  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <Image
            source={require("./assets/user2.png")}
            style={styles.profileImage}
          />
          <Text style={styles.username}>LiYing</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate("MyProfile")} 
          >
            <Text style={styles.menuText}>My Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Uploaded Post</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Saved")} 
          >
            <Text style={styles.menuText}>Saved</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Setting")} 
          >
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Log Out</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="home" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Ionicons name="map" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cameraNav}>
          <Ionicons name="camera" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Notification")}>
          <Ionicons name="notifications" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userNav}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background:{
    flex: 1, 
    backgroundColor: "#fefae0", 
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fefae0",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 10,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "contain",
    backgroundColor: "#ddd",
  },
  username: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "500",
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: "#333",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#578C5B',
    height: 60,           
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    left:0,
    right:0,
    width: "100%",
    marginTop: 150,
    padding: 0,
  },
  tab: {
    flex: 1,               
    alignItems: "center",
    justifyContent: "center",
  },
  cameraNav: {
    backgroundColor: '#578C5B',
    borderRadius: 50,
    width: 55,
    height: 55,
    marginTop: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  userNav: {
    flex: 1,                  
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#95D26D',
    borderTopRightRadius: 20, 
    borderTopLeftRadius: 20,
  },
});

