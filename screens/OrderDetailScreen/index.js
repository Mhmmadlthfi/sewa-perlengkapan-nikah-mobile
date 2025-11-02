import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  getStatusColor,
  getPaymentStatusColor,
  formatStatusText,
} from "../../src/utils";
import api from "../../services/api";
import OrderItem from "../../components/OrderItem";

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await api.get(`/user-orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError(response.data.message || "Gagal memuat detail order");
        }
      } catch (err) {
        console.error("Error fetching order detail:", err);
        setError("Terjadi kesalahan saat memuat detail order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    const value = Math.round(Number(amount) || 0);
    return `Rp${value.toLocaleString("id-ID")}`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get(`/user-orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const itemsTotal = (
    order && Array.isArray(order.items) ? order.items : []
  ).reduce((sum, it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const handleContinuePayment = async () => {
    try {
      const check = await api.post(`/orders/${orderId}/check-payment-status`);

      if (check.data.status === "paid") {
        Alert.alert("Sudah Dibayar", "Pesanan ini sudah dibayar.");
        return;
      }

      // HANYA regenerate jika expired dan konfirmasi user
      if (check.data.status === "expired") {
        Alert.alert(
          "Token Kadaluarsa",
          "Token pembayaran sudah kadaluarsa. Buat token baru?",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Buat Baru",
              onPress: async () => {
                const regen = await api.post(
                  `/orders/${orderId}/regenerate-snap`
                );
                if (regen.data.success) {
                  navigation.navigate("PaymentScreen", {
                    snapToken: regen.data.snap_token,
                    orderId: order.id,
                  });
                }
              },
            },
          ]
        );
        return;
      }

      // Untuk status pending, cancel, deny - gunakan token existing
      if (order.snap_token) {
        navigation.navigate("PaymentScreen", {
          snapToken: order.snap_token, // ✅ Pakai token existing
          orderId: order.id,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Terjadi kesalahan, coba lagi.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Data order tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#4CAF50"]}
          tintColor="#4CAF50"
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Order</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID Order</Text>
          <Text style={styles.detailValue}>{order.order_code}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tanggal Order</Text>
          <Text style={styles.detailValue}>{formatDate(order.order_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {formatStatusText(order.status)}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status Pembayaran</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getPaymentStatusColor(order.payment_status) },
            ]}
          >
            <Text style={styles.statusText}>{order.payment_status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detail Penyewaan</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tanggal Mulai</Text>
          <Text style={styles.detailValue}>
            {formatDate(order.rental_start)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tanggal Selesai</Text>
          <Text style={styles.detailValue}>{formatDate(order.rental_end)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Alamat Pengiriman</Text>
          <Text style={styles.detailValue}>{order.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Catatan</Text>
          <Text style={styles.detailValue}>{order.notes || "-"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produk Disewa</Text>
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <OrderItem key={`${item.id}_${item.product_id}`} item={item} />
          ))
        ) : (
          <Text style={styles.emptyItemText}>Tidak ada produk</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Total Harga</Text>
        <View style={styles.totalCenter}>
          <Text style={styles.totalAmountLarge}>
            {formatCurrency(itemsTotal)}
          </Text>
        </View>
      </View>

      {/* Tombol bayar: tampilkan hanya kalau masih bisa dibayar */}
      {["pending", "deny"].includes(order.payment_status) && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handleContinuePayment}
          >
            <Text style={styles.payButtonText}>Lanjutkan Pembayaran</Text>
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "center",
              color: "#666",
              marginTop: 8,
              fontSize: 12,
            }}
          >
            Pastikan menyelesaikan pembayaran sebelum batas waktu berakhir.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-end",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#F44336",
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  emptyItemText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 12,
  },
  totalSection: {
    paddingTop: 8,
  },
  totalAmountLarge: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4CAF50",
  },
  totalCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  payButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
