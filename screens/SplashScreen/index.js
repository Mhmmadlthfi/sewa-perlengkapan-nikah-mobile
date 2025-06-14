import { useEffect, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { Logo } from "../../assets";

export default function SplashScreen({ navigation }) {
  const { user, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (user) {
          navigation.replace("MainTabs");
        } else {
          navigation.replace("Login");
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Karisma Arga</Text>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        <Text style={styles.tagline}>
          {isLoading
            ? "Checking authentication..."
            : "Loading your experience..."}
        </Text>
      </View>
    </View>
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
