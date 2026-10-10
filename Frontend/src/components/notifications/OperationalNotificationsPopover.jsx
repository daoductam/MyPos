import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Bell, Package, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import useOperationalNotifications from "@/hooks/useOperationalNotifications";

const formatAmount = (amount, language) => new Intl.NumberFormat(language || "vi", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
}).format(amount);

export default function OperationalNotificationsPopover({ branchId }) {
  const { t, i18n } = useTranslation();
  const { notifications, isLoading } = useOperationalNotifications(branchId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-emerald-500 text-white">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-0">
        <div className="p-4">
          <h3 className="text-lg font-semibold">{t("dashboard.cashier.notifications")}</h3>
        </div>
        <Separator className="bg-white/10" />
        <div className="p-2 max-h-80 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <p className="p-3 text-sm text-gray-400">
              {t("dashboard.cashier.loadingNotifications", "Loading notifications...")}
            </p>
          ) : notifications.length === 0 ? (
            <p className="p-3 text-sm text-gray-400">
              {t("dashboard.cashier.noNotifications", "No new operational notifications.")}
            </p>
          ) : (
            notifications.map((notification) => {
              const isOrder = notification.type === "order";
              const Icon = isOrder ? ShoppingBag : Package;
              const iconClass = isOrder ? "text-emerald-400" : "text-yellow-400";
              const title = isOrder
                ? `${t("dashboard.cashier.newOrderTitle")} #${notification.orderId}`
                : t("dashboard.cashier.lowStockTitle");
              const description = isOrder
                ? t("dashboard.cashier.newOrderDesc", {
                    amount: formatAmount(notification.amount, i18n.language),
                  })
                : t("dashboard.cashier.lowStockDesc", {
                    product: notification.productName || `#${notification.productId}`,
                    count: notification.quantity,
                  });

              return (
                <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                  <div className="p-2 bg-black/20 rounded-full mt-1">
                    <Icon className={`h-4 w-4 ${iconClass}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
