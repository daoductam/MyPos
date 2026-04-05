export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "completed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "processing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "refunded":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};


  