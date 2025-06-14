import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getStatusColor,
  getPaymentStatusColor,
  formatStatusText,
} from "../../src/utils";
import api from "../../services/api";
import { NO_WA_OWNER } from "../../src/config";
import { OrderItem } from "../../components";

export default function OrderDetailScreen({ route }) {
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
    return `Rp${parseInt(amount).toLocaleString("id-ID")}`;
  };

  const handleContactSeller = () => {
    const phoneNumber = NO_WA_OWNER;
    const message = `Halo, saya ingin menanyakan tentang order ID ${order.id}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(url).catch(() => {
      alert("Tidak dapat membuka WhatsApp");
    });
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
          <Text style={styles.detailValue}>{order.id}</Text>
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
        <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Harga</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(order.total_price)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Biaya Pengiriman</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(order.delivery_fee)}
          </Text>
        </View>
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(
              parseInt(order.total_price) + parseInt(order.delivery_fee)
            )}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContactSeller}
      >
        <MaterialIcons name="chat" size={20} color="#fff" />
        <Text style={styles.contactButtonText}>Hubungi Penjual</Text>
      </TouchableOpacity>
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
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  contactButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
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
});
