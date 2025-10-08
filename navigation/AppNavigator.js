import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../contexts/AuthContext";
import {
  SplashScreen,
  LoginScreen,
  RegisterScreen,
  ProductDetailScreen,
  OrderDetailScreen,
  PaymentScreen,
} from "../screens";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{
              headerShown: true,
              title: "Pembayaran",
              headerBackTitle: "Kembali",
            }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              title: "Detail Produk",
              headerBackTitle: "Kembali",
            }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{
              headerShown: true,
              title: "Detail Pesanan",
              headerBackTitle: "Kembali",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
