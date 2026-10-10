import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useSidebar } from "../../../context/hooks/useSidebar";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import OperationalNotificationsPopover from "@/components/notifications/OperationalNotificationsPopover";

const POSHeader = () => {
  const { setSidebarOpen } = useSidebar();
  const { t, i18n } = useTranslation();
  const { userProfile } = useSelector((state) => state.user);
  const currentLanguage = i18n.language || "vi";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
          <h1 className="text-2xl font-bold text-white">{t("dashboard.cashier.posTitle")}</h1>
          <p className="text-sm text-gray-400">{t("dashboard.cashier.createOrder")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-xs bg-black/20 border-white/10 text-gray-300"
          >
            {t("dashboard.cashier.shortcuts")}
          </Badge>
          <OperationalNotificationsPopover branchId={userProfile?.branchId || userProfile?.branch?.id} />

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
