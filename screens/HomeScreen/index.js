import { View, Text, Button } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={{ padding: 20 }}>
      <Text>Selamat Datang, {user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
