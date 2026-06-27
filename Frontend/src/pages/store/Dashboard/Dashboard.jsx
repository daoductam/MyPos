import React from "react";
import DashboardStats from "./DashboardStats";
import SalesTrend from "./SalesTrend";
import RecentSales from "./RecentSales";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('dashboard.store.home.title')}</h2>
        <p className="text-gray-400">
          {t('dashboard.store.home.subtitle')}
        </p>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrend />
        </div>
        <div>
          <RecentSales />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
