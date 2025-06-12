import { useEffect, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { Logo } from "../../assets";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) {
        navigation.replace("Home");
      } else {
        navigation.replace("Login");
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user]);

  return (
    <LinearGradient
      colors={["#f5f7ff", "#e8ecff", "#dce2ff"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Karisma Arga</Text>
        <ActivityIndicator size="large" color="#4a7cff" style={styles.loader} />
        <Text style={styles.tagline}>Loading your experience...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a7cff",
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
