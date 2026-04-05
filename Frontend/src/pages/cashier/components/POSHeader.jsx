import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useSidebar } from "../../../context/hooks/useSidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Bell, ShoppingBag, Package, CheckCircle, Languages } from "lucide-react";

import { useTranslation } from "react-i18next";

const POSHeader = () => {
  const { setSidebarOpen } = useSidebar();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language || "vi";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  const notifications = [
    {
      icon: <ShoppingBag className="h-4 w-4 text-emerald-400" />,
      title: t('dashboard.cashier.newOrderTitle') + " #10345",
      description: t('dashboard.cashier.newOrderDesc', { amount: 'VNĐ 1,950' }),
    },
    {
      icon: <Package className="h-4 w-4 text-yellow-400" />,
      title: t('dashboard.cashier.lowStockTitle'),
      description: t('dashboard.cashier.lowStockDesc', { product: 'Shirt-345', count: 5 }),
    },
    {
      icon: <CheckCircle className="h-4 w-4 text-blue-400" />,
      title: t('dashboard.cashier.shiftSummaryReadyTitle'),
      description: t('dashboard.cashier.shiftSummaryReadyDesc'),
    },
  ];
  return (
    <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            className="z-10 p-2 rounded shadow-lg bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('dashboard.cashier.posTitle')}</h1>
          <p className="text-sm text-gray-400">{t('dashboard.cashier.createOrder')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-xs bg-black/20 border-white/10 text-gray-300"
          >
            {t('dashboard.cashier.shortcuts')}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-emerald-500 text-white">
                  {notifications.length}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-0">
              <div className="p-4">
                <h3 className="text-lg font-semibold">{t('dashboard.cashier.notifications')}</h3>
              </div>
              <Separator className="bg-white/10" />
              <div className="p-2 max-h-80 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                    <div className="p-2 bg-black/20 rounded-full mt-1">{notification.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-400">{notification.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-[10px] h-6 px-2 rounded-md transition-all ${currentLanguage.startsWith("vi") ? "bg-emerald-500 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              onClick={() => changeLanguage("vi")}
            >
              VI
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`text-[10px] h-6 px-2 rounded-md transition-all ${currentLanguage.startsWith("en") ? "bg-emerald-500 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              onClick={() => changeLanguage("en")}
            >
              EN
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default POSHeader;
