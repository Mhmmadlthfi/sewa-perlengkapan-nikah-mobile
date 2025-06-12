import { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import api from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { Logo, EyeOpen, EyeClosed } from "../../assets";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    let newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email tidak valid";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      await login(response.data.user, response.data.token);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert(
        "Login Gagal",
        error.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#f5f7ff", "#e8ecff", "#dce2ff"]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />

              <Text style={styles.title}>Masuk ke Akun Anda</Text>

              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoFocus={true}
                cursorColor="#4a7cff"
                keyboardType="email-address"
                caretHidden={false}
                textContentType="emailAddress"
                autoComplete={"email"}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  cursorColor="#4a7cff"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                    source={showPassword ? EyeOpen : EyeClosed}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Memproses..." : "Masuk"}
                </Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Belum punya akun? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={[styles.linkText, styles.registerLink]}>
                    Daftar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7ff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    padding: 30,
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#4a7cff",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#4a7cff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#4a7cff",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "baseline",
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    fontWeight: "bold",
    color: "#4a7cff",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: "#999",
  },
  inputError: {
    borderColor: "#ff4a4a",
  },
  errorText: {
    color: "#ff4a4a",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
});
