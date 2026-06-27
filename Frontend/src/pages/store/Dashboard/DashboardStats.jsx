import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DollarSign, ShoppingCart, Users, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const DashboardStats = () => {
  const { t } = useTranslation();
  const { storeOverview, loading } = useSelector((state) => state.storeAnalytics);

  const formatSales = (val) => {
    if (val === undefined || val === null) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const stats = [
    {
      title: t('dashboard.store.stats.totalRevenue'),
      value: formatSales(storeOverview?.totalSales),
      change: t('dashboard.store.stats.totalRevenueDesc') || "Tổng doanh thu tích lũy",
      icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: t('dashboard.store.stats.totalSales'),
      value: storeOverview?.totalOrders !== undefined && storeOverview?.totalOrders !== null ? storeOverview.totalOrders.toLocaleString() : "0",
      change: t('dashboard.store.stats.totalSalesDesc') || "Tổng số đơn đặt hàng đã thanh toán",
      icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: t('dashboard.store.stats.newCustomers'),
      value: storeOverview?.totalCustomers !== undefined && storeOverview?.totalCustomers !== null ? storeOverview.totalCustomers.toLocaleString() : "0",
      change: t('dashboard.store.stats.newCustomersDesc') || "Khách hàng đăng ký thành viên",
      icon: <Users className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: t('dashboard.store.stats.activeBranches'),
      value: storeOverview?.totalBranches !== undefined && storeOverview?.totalBranches !== null ? storeOverview.totalBranches.toString() : "0",
      change: t('dashboard.store.stats.activeBranchesDesc') || "Số chi nhánh đang hoạt động",
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-black/20 backdrop-blur-lg border border-white/10 text-white rounded-2xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
