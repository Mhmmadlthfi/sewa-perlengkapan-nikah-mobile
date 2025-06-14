import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCart } from "../../contexts/CartContext";
import { useNavigation } from "@react-navigation/native";
import { getImageUrl } from "../../src/utils";
import styles from "./styles";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigation = useNavigation();

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert("Berhasil", "Produk telah ditambahkan ke keranjang");
  };

  const handlePress = () => {
    navigation.navigate("ProductDetail", { product });
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: getImageUrl(product.image_url) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.noImage]}>
            <MaterialIcons name="image-not-supported" size={32} color="#999" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          Rp{parseInt(product.price).toLocaleString("id-ID")}
        </Text>
        <Text style={styles.productUnit}>
          {product.unit} • {product.category.name}
        </Text>
        <Text style={styles.productStock}>Stok: {product.stock}</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <MaterialIcons name="add-shopping-cart" size={18} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Gunakan React.memo dengan comparison function
export default React.memo(ProductCard, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
