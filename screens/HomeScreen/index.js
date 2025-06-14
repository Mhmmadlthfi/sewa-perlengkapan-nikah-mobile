import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { ProductCard } from "../../components";

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat kategori"
      );
    }
  };

  const fetchProducts = async (
    reset = false,
    categoryId = selectedCategory
  ) => {
    if (reset) {
      setPage(1);
      setHasMore(true);
    }

    if (!hasMore && !reset) return;

    try {
      setLoading(true);
      const params = {
        page: reset ? 1 : page,
        ...(searchQuery && { search: searchQuery }),
        ...(categoryId !== "all" && { category_id: categoryId }),
      };

      const response = await api.get("/products", { params });

      if (reset) {
        setProducts(response.data.products.data);
      } else {
        setProducts([...products, ...response.data.products.data]);
      }

      setHasMore(
        response.data.products.current_page < response.data.products.last_page
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat produk"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchProducts(true);
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    await fetchProducts(true, categoryId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Selamat datang,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === "all" && styles.selectedCategoryItem,
            ]}
            onPress={() => handleCategoryChange("all")}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === "all" && styles.selectedCategoryText,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id.toString() &&
                  styles.selectedCategoryItem,
              ]}
              onPress={() => handleCategoryChange(category.id.toString())}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id.toString() &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products list */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          numColumns={2}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          columnWrapperStyle={styles.productsRow}
          contentContainerStyle={styles.productsContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color="#999" />
              <Text style={styles.emptyText}>Tidak ada produk ditemukan</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  welcomeContainer: {
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    paddingVertical: 10,
    backgroundColor: "transparent",
    elevation: 0,
  },
  categoriesScrollContent: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f1f3f4",
  },
  selectedCategoryItem: {
    backgroundColor: "#4CAF50",
  },
  categoryText: {
    color: "#555",
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  productsContainer: {
    padding: 10,
  },
  productsRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
