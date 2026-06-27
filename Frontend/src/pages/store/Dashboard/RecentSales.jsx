import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

const RecentSales = () => {
  const { t } = useTranslation();
  
  // Cleaned up completely from mock data
  const actualSales = []; 

  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white h-[380px] flex flex-col justify-between rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-500" />
          {t('dashboard.store.charts.recentSales')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-6">
        {actualSales.length === 0 ? (
          <div className="text-gray-400 text-center flex flex-col items-center justify-center space-y-3 py-6">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-gray-300">Chưa có giao dịch gần đây</p>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1">Các đơn hàng mới thanh toán tại chi nhánh sẽ xuất hiện ở đây.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {/* Real sales mapping here when integrated */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
