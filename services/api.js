import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_API_URL } from "../src/config";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const excludedEndpoint = "/login";

    if (!config.url.includes(excludedEndpoint)) {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
