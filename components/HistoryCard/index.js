import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getStatusColor, getPaymentStatusColor } from "../../src/utils";

const HistoryCard = ({ order, onPress }) => {
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return `Rp${value.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>{order.order_code}</Text>
        <Text style={styles.orderDate}>{formatDate(order.order_date)}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <MaterialIcons name="date-range" size={16} color="#555" />
          <Text style={styles.dateText}>
            {formatDate(order.rental_start)} - {formatDate(order.rental_end)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
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

      <View style={styles.cardFooter}>
        <Text style={styles.totalText}>
          {formatCurrency(order.total_price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  cardBody: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default HistoryCard;
