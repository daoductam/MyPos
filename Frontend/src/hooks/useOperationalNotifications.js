import { useCallback, useEffect, useState } from "react";
import api from "@/utils/api";

const LOW_STOCK_THRESHOLD = 5;

const getData = (result) => {
  const data = result.status === "fulfilled" ? result.value.data : [];
  return Array.isArray(data) ? data : [];
};

export default function useOperationalNotifications(branchId) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!branchId) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get(`/api/v1/orders/recent/${branchId}`),
        api.get(`/api/v1/inventories/branch/${branchId}`),
      ]);
      const orders = getData(results[0]);
      const inventory = getData(results[1]);

      const orderNotifications = orders
        .filter((order) => order.status !== "REFUNDED")
        .slice(0, 3)
        .map((order) => ({
        id: `order-${order.id}`,
        type: "order",
        orderId: order.id,
        amount: Number(order.totalAmount) || 0,
        createdAt: order.createdAt,
        }));

      const stockNotifications = inventory
        .filter((item) => Number.isFinite(item.quantity) && item.quantity <= LOW_STOCK_THRESHOLD)
        .sort((first, second) => first.quantity - second.quantity)
        .slice(0, 3)
        .map((item) => ({
          id: `inventory-${item.id || item.productId}`,
          type: "lowStock",
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          updatedAt: item.lastUpdated,
        }));

      setNotifications([...orderNotifications, ...stockNotifications]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return { notifications, isLoading, refresh };
}
