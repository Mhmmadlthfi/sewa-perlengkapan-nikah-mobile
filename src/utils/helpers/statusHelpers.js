export const getStatusColor = (status) => {
  const statusColors = {
    pending: "#0d6efd", // primary (blue)
    confirmed: "#0dcaf0", // info (cyan)
    ongoing: "#ffc107", // warning (yellow)
    completed: "#198754", // success (green)
    cancelled: "#dc3545", // danger (red)
  };
  return statusColors[status.toLowerCase()] || "#6c757d"; // default gray
};

export const getPaymentStatusColor = (paymentStatus) => {
  const paymentStatusColors = {
    paid: "#198754", // success (green)
    unpaid: "#dc3545", // danger (red)
  };
  return paymentStatusColors[paymentStatus.toLowerCase()] || "#6c757d"; // default gray
};

export const formatStatusText = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
