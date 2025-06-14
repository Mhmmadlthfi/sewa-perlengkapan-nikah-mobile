import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import api from "../../services/api";
import { Logo, EyeOpen, EyeClosed } from "../../assets";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const handleRegister = async () => {
    let newErrors = {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    };

    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Nama lengkap harus diisi";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email tidak valid";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Nomor HP harus diisi";
      isValid = false;
    } else if (!/^[0-9]+$/.test(phone)) {
      newErrors.phone = "Nomor HP hanya boleh angka";
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = "Alamat harus diisi";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/register", {
        name,
        email,
        phone,
        address,
        password,
      });
      Alert.alert("Sukses", "Registrasi berhasil. Silakan login.");
      navigation.replace("Login");
    } catch (error) {
      const message = error.response?.data?.message || "Terjadi kesalahan";
      Alert.alert("Gagal", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
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

              <Text style={styles.title}>Buat Akun Baru</Text>

              {/* Input Nama */}
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Nama Lengkap"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                cursorColor="#4a7cff"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}

              {/* Input Email */}
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                cursorColor="#4a7cff"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              {/* Input Nomor HP */}
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="Nomor HP"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                cursorColor="#4a7cff"
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}

              {/* Input Alamat */}
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Alamat"
                value={address}
                onChangeText={setAddress}
                cursorColor="#4a7cff"
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}

              {/* Input Password */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="Password"
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
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
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
  registerButton: {
    backgroundColor: "#4a7cff",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 15,
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
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#4a7cff",
    fontWeight: "bold",
    fontSize: 14,
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
});
