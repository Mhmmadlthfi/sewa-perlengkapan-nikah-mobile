import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          const response = await api.get("/user", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Gagal memuat token", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    await AsyncStorage.setItem("token", authToken);
  };

  const logout = async () => {
    try {
      await api.post("/logout", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Gagal logout", error);
    }
  };

  // Development
  const clearTokens = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage cleared completely");
    } catch (error) {
      console.error("Clear storage error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        clearTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
