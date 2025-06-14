import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import RenderHtml from "react-native-render-html";
import { getImageUrl } from "../../src/utils";

const ProductDetailScreen = () => {
  const route = useRoute();
  const { product } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image
            source={{
              uri: getImageUrl(product.image_url),
            }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <MaterialIcons name="image-not-supported" size={64} color="#999" />
            <Text style={styles.noImageText}>Gambar tidak tersedia</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              Rp{parseInt(product.price).toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialIcons name="category" size={18} color="#666" />
            <Text style={styles.metaText}>{product.category.name}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="straighten" size={18} color="#666" />
            <Text style={styles.metaText}>{product.unit}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="inventory" size={18} color="#666" />
            <Text style={styles.metaText}>{product.stock} tersedia</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          {product.description ? (
            <RenderHtml
              contentWidth={300}
              source={{ html: product.description }}
              baseStyle={styles.descriptionText}
            />
          ) : (
            <Text style={styles.noDescription}>
              Tidak ada deskripsi tersedia
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    color: "#333",
  },
  priceContainer: {
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  metaContainer: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  noDescription: {
    fontStyle: "italic",
    color: "#999",
    fontSize: 14,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  noImageText: {
    marginTop: 8,
    color: "#999",
    fontSize: 16,
  },
});

export default ProductDetailScreen;
