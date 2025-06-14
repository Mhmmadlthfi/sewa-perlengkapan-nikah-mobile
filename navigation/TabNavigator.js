import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import {
  HomeScreen,
  CartScreen,
  HistoryScreen,
  ProfileScreen,
} from "../screens";
import { useCart } from "../contexts/CartContext";

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cartIconContainer: {
    position: "relative",
  },
});

export default function TabNavigator() {
  const { cartItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          title: "Beranda",
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.cartIconContainer}>
              <MaterialIcons name="shopping-cart" size={size} color={color} />
              {cartItems.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </Text>
                </View>
              )}
            </View>
          ),
          title: "Keranjang",
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
          title: "Riwayat",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
          title: "Profil",
        }}
      />
    </Tab.Navigator>
  );
}
