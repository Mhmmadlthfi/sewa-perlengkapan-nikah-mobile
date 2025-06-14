import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <MaterialIcons name="person" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.userName}>{user?.name || "Nama Pengguna"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Informasi Profil</Text>

        <View style={styles.detailItem}>
          <MaterialIcons name="phone" size={20} color="#666" />
          <Text style={styles.detailText}>{user?.phone || "Belum diisi"}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <Text style={styles.detailText}>
            {user?.address || "Belum diisi"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="verified-user" size={20} color="#666" />
          <Text style={styles.detailText}>
            Status: {user?.is_active ? "Aktif" : "Nonaktif"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    marginTop: 30,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileIcon: {
    backgroundColor: "#e8f5e9",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
