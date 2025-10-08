import React from "react";
import { View, Text, StyleSheet } from "react-native";

const formatCurrency = (amount) => {
  const value = Math.round(Number(amount) || 0);
  return `Rp${value.toLocaleString("id-ID")}`;
};

const OrderItem = ({ item }) => {
  const priceValue = Number(item.price) || 0;
  const subtotal = priceValue * (Number(item.quantity) || 0);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.productName}>
          {item.product?.name || "Produk tidak diketahui"}
        </Text>
        <Text style={styles.priceText}>
          {formatCurrency(priceValue)} x {item.quantity}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.subtotalText}>{formatCurrency(subtotal)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  leftSection: {
    flex: 2.5,
  },
  rightSection: {
    flex: 1.5,
    alignItems: "flex-end",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 13,
    color: "#666",
  },
  subtotalText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4CAF50",
  },
});

export default OrderItem;
