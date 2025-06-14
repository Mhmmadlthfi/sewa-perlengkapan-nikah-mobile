import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../../contexts/CartContext";
import { AuthContext } from "../../contexts/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../services/api";
import { NO_WA_OWNER } from "../../src/config";

const CartScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const [rentalStart, setRentalStart] = useState(new Date());
  const [rentalEnd, setRentalEnd] = useState(new Date());
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleCheckAvailability = async () => {
    if (!address) {
      Alert.alert("Error", "Alamat pengiriman harus diisi");
      return;
    }

    if (rentalStart >= rentalEnd) {
      Alert.alert("Error", "Tanggal akhir harus setelah tanggal mulai");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/check-availability", {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        rental_start: rentalStart.toISOString().split("T")[0],
        rental_end: rentalEnd.toISOString().split("T")[0],
      });

      if (response.data.success) {
        Alert.alert("Tersedia", response.data.message);
      } else {
        Alert.alert("Tidak Tersedia", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memeriksa ketersediaan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!address) {
      Alert.alert("Error", "Alamat pengiriman harus diisi");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (rentalStart < today) {
      Alert.alert("Error", "Tanggal mulai tidak boleh kurang dari hari ini");
      return;
    }

    if (rentalStart >= rentalEnd) {
      Alert.alert("Error", "Tanggal akhir harus setelah tanggal mulai");
      return;
    }

    const orderData = {
      user_id: user.id,
      rental_start: rentalStart.toISOString().split("T")[0],
      rental_end: rentalEnd.toISOString().split("T")[0],
      address,
      notes,
      items: cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
    };

    setLoading(true);
    try {
      const response = await api.post("/rental-orders", orderData);

      if (response.data.success) {
        const whatsappUrl = generateWhatsAppLink(orderData);

        Linking.openURL(whatsappUrl).catch(() => {
          Alert.alert("Error", "Tidak dapat membuka WhatsApp");
        });

        clearCart();
        navigation.navigate("History");
      } else {
        Alert.alert("Error", response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error detail:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat memproses pesanan";
      Alert.alert("Terjadi Kesalahan", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = (orderData) => {
    const recipientPhone = NO_WA_OWNER;

    let message = `Halo, saya ingin melakukan pemesanan:\n\n`;
    message += `Nama: ${user.name}\n`;
    message += `No Telepon: ${user.phone}\n`;
    message += `Email: ${user.email}\n`;
    message += `Alamat: ${orderData.address}\n`;
    message += `Tanggal sewa: ${orderData.rental_start} s/d ${orderData.rental_end}\n\n`;
    message += `Pesanan:\n`;

    cartItems.forEach((item) => {
      const subtotal = parseFloat(item.price) * item.quantity;
      message += `- ${item.name} | Rp${parseFloat(item.price).toLocaleString(
        "id-ID"
      )} x ${item.quantity} = Rp${subtotal.toLocaleString("id-ID")}\n`;
    });

    message += `\nTotal: Rp${totalPrice.toLocaleString("id-ID")}\n`;
    message += `\nCatatan: ${orderData.notes || "-"}\n`;
    message += `\nTerima kasih.`;

    return `https://wa.me/${recipientPhone}?text=${encodeURIComponent(
      message
    )}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          Rp{parseFloat(item.price).toLocaleString("id-ID")}{" "}
          {/* Hanya tampilkan harga dasar */}
        </Text>
        <Text style={styles.itemUnit}>
          {item.unit} (x{item.quantity}) {/* Tampilkan quantity di sini */}
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="remove" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => removeFromCart(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Detail Penyewaan</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Mulai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>{rentalStart.toLocaleDateString("id-ID")}</Text>
              {showStartPicker && (
                <DateTimePicker
                  value={rentalStart}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (selectedDate) {
                      setRentalStart(selectedDate);
                    }
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Selesai</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>{rentalEnd.toLocaleDateString("id-ID")}</Text>
              {showEndPicker && (
                <DateTimePicker
                  value={rentalEnd}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (selectedDate) {
                      setRentalEnd(selectedDate);
                    }
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat Pengiriman</Text>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Masukkan alamat lengkap"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Masukkan catatan tambahan"
              multiline
            />
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Produk Disewa</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Keranjang kosong</Text>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.summaryContainer}>
        <Text style={styles.totalText}>
          Total: Rp{totalPrice.toLocaleString("id-ID")}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.checkButton]}
            onPress={handleCheckAvailability}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cek Ketersediaan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.checkoutButton]}
            onPress={handleSubmitOrder}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Buat Pesanan</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    elevation: 2,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
    textAlignVertical: "top",
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 4,
  },
  itemUnit: {
    fontSize: 12,
    color: "#757575",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    backgroundColor: "#2196F3",
    marginRight: 8,
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
});

export default CartScreen;
