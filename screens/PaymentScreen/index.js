import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useCart } from "../../contexts/CartContext";
import { MIDTRANS_CLIENT_KEY, MIDTRANS_BASE_URL } from "../../src/config";
import api from "../../services/api";

export default function PaymentScreen({ route, navigation }) {
  const { snapToken, orderId } = route.params || {};
  const { clearCart } = useCart();

  const [currentSnapToken, setCurrentSnapToken] = useState(snapToken);
  const [loadingRegenerate, setLoadingRegenerate] = useState(false);

  const handledRef = useRef(false);
  const navRef = useRef(false);
  const isMounted = useRef(true);
  const lastHandledUrl = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!snapToken) {
      Alert.alert("Error", "Token pembayaran tidak tersedia.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else if (!MIDTRANS_CLIENT_KEY) {
      Alert.alert(
        "Konfigurasi Error",
        "MIDTRANS_CLIENT_KEY belum dikonfigurasi.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [snapToken, MIDTRANS_CLIENT_KEY, navigation]);

  // 🔁 Regenerate Snap Token
  const regenerateToken = async () => {
    if (!orderId) return;
    try {
      setLoadingRegenerate(true);
      const response = await api.post(`/orders/${orderId}/regenerate-snap`);
      if (response.data?.snap_token) {
        setCurrentSnapToken(response.data.snap_token);
        handledRef.current = false;
        Alert.alert(
          "Token Diperbarui",
          "Silakan lanjutkan pembayaran kembali."
        );
      } else {
        Alert.alert(
          "Gagal Memperbarui Token",
          "Token tidak tersedia, coba ulangi nanti."
        );
        navigation.goBack();
      }
    } catch (err) {
      console.error("regenerateToken error", err);
      Alert.alert(
        "Gagal Memperbarui Token",
        "Terjadi kesalahan saat memperbarui token."
      );
      navigation.goBack();
    } finally {
      setLoadingRegenerate(false);
    }
  };

  // 🧩 Handler redirect dari Midtrans (expired / return)
  const handleExpiredOrReturn = (reason) => {
    if (handledRef.current) return;
    handledRef.current = true;

    if (reason === "expired") {
      Alert.alert(
        "Token Kadaluarsa",
        "Token pembayaran sudah kadaluarsa. Kami akan mencoba memperbaruinya.",
        [{ text: "OK", onPress: regenerateToken }]
      );
      return;
    }

    // reason === 'return'
    clearCart();
    if (navRef.current) return;
    navRef.current = true;
    Alert.alert("Selesai", "Anda kembali ke halaman merchant.", [
      {
        text: "OK",
        onPress: () => {
          if (!isMounted.current) return;
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "MainTabs",
                state: { index: 0, routes: [{ name: "History" }] },
              },
            ],
          });
          setTimeout(
            () => navigation.navigate("OrderDetail", { orderId }),
            300
          );
        },
      },
    ]);
  };

  // 🌐 Detect perubahan URL di WebView
  const handleWebViewNavigationStateChange = (navState) => {
    const url = navState.url || "";
    if (!url || url === lastHandledUrl.current) return;
    lastHandledUrl.current = url;

    // Parse URL query untuk ambil parameter Midtrans
    try {
      const parsed = new URL(url);
      const params = Object.fromEntries(parsed.searchParams.entries());
      const transactionStatus = params.transaction_status;
      const orderCode = params.order_id;

      // 🔹 Jika status expire → minta regenerate
      if (
        transactionStatus === "expire" ||
        url.includes("expired") ||
        url.includes("transaction_status=expire")
      ) {
        handleExpiredOrReturn("expired");
        return;
      }

      // 🔹 Jika menuju /payment/finish → anggap selesai
      if (url.includes("/payment/finish")) {
        if (handledRef.current) return;
        handledRef.current = true;

        clearCart();
        if (navRef.current) return;
        navRef.current = true;

        const successStatuses = ["settlement", "pending"];
        const isSuccess = successStatuses.includes(transactionStatus);

        Alert.alert(
          isSuccess ? "Pembayaran Berhasil" : "Status Pembayaran",
          isSuccess
            ? `Transaksi ${orderCode} berhasil (${transactionStatus}).`
            : `Transaksi ${orderCode} berstatus: ${transactionStatus}.`,
          [
            {
              text: "OK",
              onPress: () => {
                if (!isMounted.current) return;
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "MainTabs",
                      state: { index: 0, routes: [{ name: "History" }] },
                    },
                  ],
                });
                setTimeout(
                  () => navigation.navigate("OrderDetail", { orderId }),
                  300
                );
              },
            },
          ]
        );
        return;
      }
    } catch (err) {
      console.log("URL parse error:", err);
    }
  };

  // 📬 Pesan dari Snap.js
  const handleMessage = (event) => {
    if (handledRef.current) return;
    handledRef.current = true;

    let data = null;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      const raw = String(event.nativeEvent.data || "").toLowerCase();
      if (raw.includes("success")) data = { status: "success" };
      else if (raw.includes("pending")) data = { status: "pending" };
      else if (raw.includes("error")) data = { status: "error" };
      else if (raw.includes("closed")) data = { status: "closed" };
      else data = { status: "unknown" };
    }

    // ✅ success / pending
    if (data.status === "success" || data.status === "pending") {
      clearCart();
      if (navRef.current) return;
      navRef.current = true;

      setTimeout(() => {
        if (!isMounted.current) return;
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "MainTabs",
              state: { index: 0, routes: [{ name: "History" }] },
            },
          ],
        });
        setTimeout(() => navigation.navigate("OrderDetail", { orderId }), 300);
      }, 150);
      return;
    }

    // ⚠️ error
    if (data.status === "error") {
      const isExpire =
        data.result?.status_message?.toLowerCase?.().includes("expire") ||
        String(event.nativeEvent.data || "")
          .toLowerCase()
          .includes("expire");

      if (isExpire) {
        handledRef.current = false;
        Alert.alert(
          "Token Kadaluarsa",
          "Token pembayaran sudah tidak berlaku. Kami akan mencoba memperbaruinya.",
          [{ text: "OK", onPress: regenerateToken }]
        );
        return;
      }

      clearCart();
      if (navRef.current) return;
      navRef.current = true;
      Alert.alert(
        "Pembayaran Gagal",
        "Terjadi kesalahan pada proses pembayaran.",
        [
          {
            text: "OK",
            onPress: () => {
              if (!isMounted.current) return;
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "MainTabs",
                    state: { index: 0, routes: [{ name: "History" }] },
                  },
                ],
              });
            },
          },
        ]
      );
      return;
    }

    // ❌ closed / unknown
    clearCart();
    if (navRef.current) return;
    navRef.current = true;
    Alert.alert("Pembayaran Dibatalkan", "Anda menutup jendela pembayaran.", [
      {
        text: "OK",
        onPress: () => {
          if (!isMounted.current) return;
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "MainTabs",
                state: { index: 0, routes: [{ name: "History" }] },
              },
            ],
          });
        },
      },
    ]);
  };

  // 🧱 HTML Snap.js
  const html = useMemo(() => {
    return `
    <!doctype html>
    <html>
    <head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body>
      <script src="${MIDTRANS_BASE_URL}" data-client-key="${MIDTRANS_CLIENT_KEY}"></script>
      <script>
        function pay() {
          try {
            window.snap.pay('${currentSnapToken}', {
              onSuccess: function(result){ window.ReactNativeWebView.postMessage(JSON.stringify({status:'success', result})); },
              onPending: function(result){ window.ReactNativeWebView.postMessage(JSON.stringify({status:'pending', result})); },
              onError: function(result){ window.ReactNativeWebView.postMessage(JSON.stringify({status:'error', result})); },
              onClose: function(){ window.ReactNativeWebView.postMessage(JSON.stringify({status:'closed'})); }
            });
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({status:'error', message:String(e)}));
          }
        }
        document.addEventListener('DOMContentLoaded', pay);
      </script>
    </body>
    </html>
  `;
  }, [currentSnapToken, MIDTRANS_CLIENT_KEY, MIDTRANS_BASE_URL]);

  if (!currentSnapToken || !MIDTRANS_CLIENT_KEY) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onShouldStartLoadWithRequest={(req) => {
          const u = req.url || "";
          if (
            u.includes("status=expire") ||
            u.includes("expired") ||
            u.includes("transaction_status=expire")
          ) {
            handleExpiredOrReturn("expired");
            return false;
          }
          if (u.includes("/finish")) {
            handleExpiredOrReturn("return");
            return false;
          }
          return true;
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={{ flex: 1 }} />}
      />
    </View>
  );
}
