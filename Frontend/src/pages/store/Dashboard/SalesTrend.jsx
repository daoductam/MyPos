import React from "react";
import { useSelector } from "react-redux";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";

const SalesTrend = () => {
 const { t } = useTranslation();
 const { monthlySales, loading } = useSelector((state) => state.storeAnalytics);

 // Map actual data from Backend
 const actualData = monthlySales && monthlySales.length > 0
   ? monthlySales.map(point => {
       const dateObj = new Date(point.date);
       const monthName = dateObj.toLocaleDateString('vi-VN', { month: 'short' });
       return {
         name: monthName,
         sales: point.totalAmount || 0
       };
     })
   : [];

 const hasData = actualData.length > 0;

 return (
   <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white rounded-2xl h-[380px] flex flex-col justify-between">
     <CardHeader className="pb-2">
       <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
         <TrendingUp className="w-5 h-5 text-emerald-500" />
         {t('dashboard.store.charts.salesTrend')}
       </CardTitle>
     </CardHeader>
     <CardContent className="flex-1 flex items-center justify-center p-6">
       {loading ? (
         <div className="text-gray-400 flex flex-col items-center gap-2">
           <span className="text-sm">Đang tải dữ liệu biểu đồ...</span>
         </div>
       ) : !hasData ? (
         <div className="text-gray-400 text-center flex flex-col items-center justify-center space-y-3 py-8">
           <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-500">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <p className="font-medium text-gray-300">Không có dữ liệu xu hướng doanh số</p>
             <p className="text-xs text-gray-500 max-w-xs mt-1">Hệ thống chưa ghi nhận giao dịch bán hàng nào trong tháng này để vẽ biểu đồ.</p>
           </div>
         </div>
       ) : (
         <ResponsiveContainer width="100%" height={260}>
           <AreaChart data={actualData}>
             <defs>
               <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
             <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
             <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toLocaleString()} ₫`} />
             <Tooltip
               cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
               contentStyle={{
                 backgroundColor: 'rgba(31, 41, 55, 0.7)',
                 borderColor: 'rgba(255, 255, 255, 0.2)',
                 backdropFilter: 'blur(8px)',
                 borderRadius: '0.75rem',
                 color: 'white'
               }}
               labelStyle={{ color: 'white' }}
               formatter={(value) => [`${value.toLocaleString()} ₫`, "Doanh số"]}
             />
             <Area
               type="monotone"
               dataKey="sales"
               stroke="#10b981"
               strokeWidth={2}
               fillOpacity={1}
               fill="url(#colorSales)"
             />
           </AreaChart>
         </ResponsiveContainer>
       )}
     </CardContent>
   </Card>
 );
};

export default SalesTrend;
