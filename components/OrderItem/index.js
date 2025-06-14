import React from "react";
import { View, Text, StyleSheet } from "react-native";

const OrderItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <View style={styles.itemInfo}>
        <Text style={styles.productName}>Produk ID: {item.product_id}</Text>
        <Text style={styles.price}>
          Harga: Rp{parseInt(item.price).toLocaleString("id-ID")}
        </Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>x{item.quantity}</Text>
        <Text style={styles.subtotal}>
          Rp{(item.quantity * item.price).toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  price: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  quantityContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  quantity: {
    fontSize: 14,
    color: "#333",
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
});

export default OrderItem;
