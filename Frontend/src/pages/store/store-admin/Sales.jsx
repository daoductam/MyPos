import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Search, Filter, Calendar, Download, Plus, Edit, Trash2, CreditCard, DollarSign, User, Store } from "lucide-react";
import { 
  getStoreOverview, 
  getDailySales, 
  getSalesByPaymentMethod 
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export default function Sales() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const { 
    storeOverview, 
    dailySales, 
    salesByPaymentMethod, 
    loading 
  } = useSelector((state) => state.storeAnalytics);


  useEffect(() => {
    if (userProfile?.id) {
      fetchSalesData();
    }
  }, [userProfile]);

  const fetchSalesData = async () => {
    try {
      await Promise.all([
        dispatch(getStoreOverview(userProfile.id)).unwrap(),
        dispatch(getDailySales(userProfile.id)).unwrap(),
        dispatch(getSalesByPaymentMethod(userProfile.id)).unwrap(),
      ]);
    } catch (err) {
      toast({
        title: t('toast.error'),
        description: err || t('toast.fetchError'),
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format percentage change
  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // Prepare chart data
  const dailySalesData = dailySales?.map(item => ({
    date: new Date(item.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item.totalAmount
  })) || [];

  const paymentMethodData = salesByPaymentMethod?.map(item => ({
    name: item.paymentMethod,
    value: item.totalAmount
  })) || [];

  const salesConfig = {
    sales: {
      label: t('storeModule.sales.totalSales'),
      color: "#10b981",
    },
  };

  const paymentConfig = {
    value: {
      label: "Amount",
      color: "#10b981",
    },
  };

  console.log("sales daily", dailySales)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('storeModule.sales.title')}</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> {t('storeModule.sales.newSale')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('storeModule.sales.totalSales')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(storeOverview?.totalSales || 0)
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales)
                  )} {t('storeModule.sales.fromLastWeek')}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('storeModule.sales.ordersToday')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.todayOrders || 0
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.todayOrders, storeOverview?.yesterdayOrders)
                  )} {t('storeModule.sales.fromYesterday')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('storeModule.sales.activeCashiers')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.activeCashiers || 0
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    t('storeModule.sales.sameAsYesterday')
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('storeModule.sales.avgOrderValue')}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(storeOverview?.averageOrderValue || 0)
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.averageOrderValue, storeOverview?.previousPeriodAverageOrderValue)
                  )} {t('storeModule.sales.fromLastWeek')}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('storeModule.sales.dailySales')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">{t('storeModule.sales.loadingChart')}</p>
                </div>
              </div>
            ) : dailySalesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dailySalesData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), t('storeModule.sales.totalSales')]}
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="stroke-emerald-500"
                      activeDot={{ r: 8, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">{t('storeModule.sales.noSalesData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('storeModule.sales.paymentMethods')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">{t('storeModule.sales.loadingChart')}</p>
                </div>
              </div>
            ) : paymentMethodData.length > 0 ? (
              <ChartContainer config={paymentConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={paymentMethodData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Amount"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="value"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-emerald-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">{t('storeModule.sales.noPaymentData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    
    </div>
  );
}