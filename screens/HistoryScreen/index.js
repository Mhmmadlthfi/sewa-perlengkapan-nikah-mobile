import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { HistoryCard } from "../../components";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function HistoryScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/user-orders");

      if (response.data.success) {
        setOrders(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Gagal memuat riwayat order");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Terjadi kesalahan saat memuat riwayat order");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCardPress = (order) => {
    navigation.navigate("OrderDetail", { orderId: order.id });
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchOrders();
          }}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Belum ada riwayat order</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchOrders();
          }}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <HistoryCard order={item} onPress={() => handleCardPress(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    marginTop: 30,
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    marginBottom: 16,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#F44336",
    marginTop: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
