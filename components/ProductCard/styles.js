import { StyleSheet } from "react-native";

export default StyleSheet.create({
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
    height: 40,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 5,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
  },
});
