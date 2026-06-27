import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { FileText, BarChart2, Users, Package, Download, GitBranch, Calendar, Printer, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
  getDailySales, 
  getSalesByBranch, 
  getSalesByCategory, 
  getSalesByPaymentMethod,
  getBranchPerformance
} from "../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "../../../components/ui/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  const { t } = t => t; // fallback or i18next
  const { t: translate } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { userProfile } = useSelector((state) => state.user);
  const { 
    dailySales, 
    salesByBranch, 
    salesByCategory, 
    salesByPaymentMethod, 
    branchPerformance,
    loading 
  } = useSelector((state) => state.storeAnalytics);

  const [activeReport, setActiveReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("30"); // 7, 30, 90 days

  // Color palette for charts
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#f43f5e"];

  const reportTypes = [
    {
      id: "overallSales",
      title: translate('storeModule.reports.types.overallSales.title') || "Báo cáo tổng doanh số",
      description: translate('storeModule.reports.types.overallSales.desc') || "Dữ liệu bán hàng tổng hợp từ tất cả các chi nhánh, bao gồm doanh thu và lợi nhuận.",
      icon: <BarChart2 className="w-6 h-6 text-emerald-400" />,
      thunk: getDailySales,
      stateKey: "dailySales",
    },
    {
      id: "branchPerformance",
      title: translate('storeModule.reports.types.branchPerformance.title') || "Hiệu suất chi nhánh",
      description: translate('storeModule.reports.types.branchPerformance.desc') || "So sánh doanh số, đơn đặt hàng và doanh thu giữa các chi nhánh khác nhau.",
      icon: <GitBranch className="w-6 h-6 text-emerald-400" />,
      thunk: getSalesByBranch,
      stateKey: "salesByBranch",
    },
    {
      id: "productPerformance",
      title: translate('storeModule.reports.types.productPerformance.title') || "Hiệu suất danh mục sản phẩm",
      description: translate('storeModule.reports.types.productPerformance.desc') || "Thông tin chi tiết về các sản phẩm bán chạy nhất và hiệu suất từng nhóm danh mục.",
      icon: <Package className="w-6 h-6 text-emerald-400" />,
      thunk: getSalesByCategory,
      stateKey: "salesByCategory",
    },
    {
      id: "paymentMethod",
      title: translate('storeModule.reports.types.employeeSales.title') || "Hiệu suất phương thức thanh toán",
      description: translate('storeModule.reports.types.employeeSales.desc') || "Theo dõi tỷ trọng sử dụng các phương thức thanh toán khác nhau của khách hàng.",
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      thunk: getSalesByPaymentMethod,
      stateKey: "salesByPaymentMethod",
    },
  ];

  const handleOpenReport = (report) => {
    setActiveReport(report);
    setIsModalOpen(true);
    if (userProfile?.id) {
      dispatch(report.thunk(userProfile.id));
    }
  };

  const getActiveReportData = () => {
    if (!activeReport) return [];
    switch (activeReport.id) {
      case "overallSales":
        return dailySales || [];
      case "branchPerformance":
        return salesByBranch || [];
      case "productPerformance":
        return salesByCategory || [];
      case "paymentMethod":
        return salesByPaymentMethod || [];
      default:
        return [];
    }
  };

  // Helper to format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Export data to CSV format
  const handleExportCSV = () => {
    const data = getActiveReportData();
    if (data.length === 0) {
      toast({
        title: translate('toast.error'),
        description: "Không có dữ liệu để xuất file CSV.",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    // Create headers
    const sampleItem = data[0];
    const headers = Object.keys(sampleItem).join(",");
    csvContent += headers + "\r\n";

    // Add rows
    data.forEach((item) => {
      const row = Object.values(item).map(val => {
        // Wrap string values in quotes to prevent issues with commas
        return typeof val === 'string' ? `"${val}"` : val;
      }).join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport.id}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: translate('toast.success'),
      description: "Đã xuất file CSV thành công!",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Render Charts based on active report
  const renderReportChart = () => {
    const data = getActiveReportData();
    if (data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/10">
          <p className="text-gray-400">Không tìm thấy dữ liệu phù hợp.</p>
        </div>
      );
    }

    if (activeReport.id === "overallSales") {
      const formattedData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
        amount: item.totalAmount
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} />
            <Tooltip 
              formatter={(value) => [formatVND(value), "Doanh số"]}
              contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
            />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (activeReport.id === "branchPerformance") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="branchName" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} />
            <Tooltip 
              formatter={(value) => [formatVND(value), "Doanh số"]}
              contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
            />
            <Bar dataKey="totalAmount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeReport.id === "productPerformance") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} />
            <YAxis dataKey="categoryName" type="category" stroke="#9ca3af" fontSize={12} width={100} />
            <Tooltip 
              formatter={(value) => [formatVND(value), "Doanh số"]}
              contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
            />
            <Bar dataKey="totalAmount" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeReport.id === "paymentMethod") {
      const formattedData = data.map(item => ({
        name: item.paymentMethod,
        value: item.totalAmount
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatVND(value), "Số tiền"]}
              contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#fff" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{translate('storeModule.reports.title') || "Báo cáo"}</h2>
        <p className="text-gray-400">
          {translate('storeModule.reports.subtitle') || "Tạo và tải xuống các báo cáo tổng hợp cho toàn bộ cửa hàng của bạn."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-lg border border-white/10 text-white flex flex-col hover:border-emerald-500/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                {report.icon}
              </div>
              <CardTitle className="text-lg font-semibold text-white">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-gray-400">{report.description}</p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button 
                onClick={() => handleOpenReport(report)}
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                {translate('storeModule.reports.generateReport') || "Tạo báo cáo"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Dynamic Report Details Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-gray-900/95 border border-white/10 text-white backdrop-blur-md max-h-[90vh] overflow-y-auto print:bg-white print:text-black">
          <DialogHeader className="border-b border-white/10 pb-4 print:border-black">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {activeReport?.icon}
              {activeReport?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-1">
              {activeReport?.description}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Filter controls */}
              <div className="flex flex-wrap justify-between gap-4 items-center bg-black/20 p-4 rounded-xl border border-white/5 print:hidden">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Khoảng thời gian:</span>
                  <select 
                    value={filterPeriod} 
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="7" className="bg-gray-800">7 ngày qua</option>
                    <option value="30" className="bg-gray-800">30 ngày qua</option>
                    <option value="90" className="bg-gray-800">30 ngày tiếp</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleExportCSV} variant="outline" className="border-white/10 hover:bg-white/5">
                    <Download className="w-4 h-4 mr-2" /> Xuất CSV
                  </Button>
                  <Button onClick={handlePrint} variant="outline" className="border-white/10 hover:bg-white/5">
                    <Printer className="w-4 h-4 mr-2" /> In Báo Cáo
                  </Button>
                </div>
              </div>

              {/* Chart Section */}
              <div className="p-6 bg-black/25 rounded-2xl border border-white/10 print:border-black print:bg-transparent">
                <h4 className="text-md font-medium text-gray-300 mb-4 print:text-black">Biểu đồ thống kê</h4>
                {renderReportChart()}
              </div>

              {/* Detailed Data Table */}
              <div className="overflow-x-auto border border-white/10 rounded-2xl">
                <table className="w-full text-sm text-left text-gray-300 print:text-black">
                  <thead className="text-xs uppercase bg-black/40 text-gray-400 print:bg-gray-100 print:text-black">
                    <tr>
                      {getActiveReportData().length > 0 && 
                        Object.keys(getActiveReportData()[0]).map((key, i) => (
                          <th key={i} className="px-6 py-4">{key}</th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {getActiveReportData().map((item, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 print:border-black">
                        {Object.values(item).map((val, i) => (
                          <td key={i} className="px-6 py-4 font-medium">
                            {typeof val === 'number' && (i === 1 || val > 1000) ? formatVND(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Reports;
