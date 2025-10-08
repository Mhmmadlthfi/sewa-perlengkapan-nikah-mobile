// ====================================
// 🌐 API Configuration
// ====================================

// Development (local)
// export const BASE_API_URL = "http://192.168.43.205:8000/api";
// export const BASE_STORAGE_URL = "http://192.168.43.205:8000/storage";

// Production (server)
export const BASE_API_URL = "https://amalia-hanifah.unitech.my.id/api";
export const BASE_STORAGE_URL = "https://amalia-hanifah.unitech.my.id/storage";
// ====================================
// 💳 Midtrans Configuration
// ====================================

// Mode: 'sandbox' | 'production'
export const MIDTRANS_MODE = "sandbox";

// Client Key per environment
export const MIDTRANS_CLIENT_KEY =
  MIDTRANS_MODE === "production"
    ? "Mid-client-hce2kvl9ChTYmqrf" // production key
    : "Mid-client-PVfvuH-TAbfjRVox"; // sandbox key

// Base URL snap.js sesuai mode
export const MIDTRANS_BASE_URL =
  MIDTRANS_MODE === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
