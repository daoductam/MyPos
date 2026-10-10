import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Users, Package, Download } from "lucide-react";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";

export default function Reports() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const reportTypes = [
    {
      id: "sales",
      title: t('dashboard.branchManager.reports.types.sales.title'),
      description: t('dashboard.branchManager.reports.types.sales.desc'),
      icon: <BarChart2 className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "inventory",
      title: t('dashboard.branchManager.reports.types.inventory.title'),
      description: t('dashboard.branchManager.reports.types.inventory.desc'),
      icon: <Package className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "customer",
      title: t('dashboard.branchManager.reports.types.customer.title'),
      description: t('dashboard.branchManager.reports.types.customer.desc'),
      icon: <Users className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "employee",
      title: t('dashboard.branchManager.reports.types.employee.title'),
      description: t('dashboard.branchManager.reports.types.employee.desc'),
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "transaction",
      title: t('dashboard.branchManager.reports.types.transaction.title'),
      description: t('dashboard.branchManager.reports.types.transaction.desc'),
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "tax",
      title: t('dashboard.branchManager.reports.types.tax.title'),
      description: t('dashboard.branchManager.reports.types.tax.desc'),
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
  ];

  const handleGenerateReport = async (report) => {
    const branchId = userProfile?.branchId;
    if (!branchId) {
      toast({
        title: t("dashboard.branchManager.reports.title"),
        description: t("dashboard.branchManager.reports.branchMissing", "No branch is assigned to this account."),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requests = {
        sales: () => api.get("/api/v1/branch-analytics/daily-sales", { params: { branchId, days: 30 } }),
        inventory: () => api.get(`/api/v1/inventories/branch/${branchId}`),
        customer: () => api.get("/api/v1/customers"),
        employee: () => api.get(`/api/v1/employees/branch/${branchId}`),
        transaction: () => api.get(`/api/v1/orders/branch/${branchId}`, { params: { status: "COMPLETED" } }),
        tax: () => api.get(`/api/v1/orders/branch/${branchId}`, { params: { status: "COMPLETED" } }),
      };
      const response = await requests[report.id]();
      const data = Array.isArray(response.data) ? response.data : [];
      const columns = {
        sales: ["date", "totalSales", "totalOrders"],
        inventory: ["product", "quantity", "lastUpdated"],
        customer: ["fullName", "email", "phone", "loyaltyPoints"],
        employee: ["fullName", "email", "role", "accessEnabled"],
        transaction: ["id", "status", "totalAmount", "paymentType", "createdAt"],
        tax: ["id", "taxAmount", "totalAmount", "createdAt"],
      }[report.id];
      const normalizeRow = (item) => {
        if (report.id === "inventory") {
          return { product: item.product?.name || item.productName || item.name || "-", quantity: item.quantity, lastUpdated: item.lastUpdated };
        }
        if (report.id === "sales") return item;
        if (report.id === "tax") return { ...item, taxAmount: item.taxAmount ?? 0 };
        return item;
      };

      const doc = new jsPDF();
      const safeText = (value) => String(value ?? "-").replace(/[^\x20-\x7E]/g, "?");
      let y = 20;
      const addLine = (text, size = 10) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(size);
        doc.text(safeText(text).slice(0, 115), 14, y);
        y += size >= 16 ? 10 : 7;
      };
      addLine(report.title, 18);
      addLine(`Branch ${branchId} | Generated ${new Date().toLocaleString()}`, 9);
      addLine(`Records: ${data.length}`, 9);
      y += 3;
      data.forEach((item, index) => {
        const row = normalizeRow(item);
        addLine(`${index + 1}. ${columns.map((column) => `${column}: ${safeText(row[column])}`).join(" | ")}`);
      });
      if (!data.length) addLine(t("dashboard.branchManager.reports.noData", "No data found for the selected report."));
      doc.save(`${report.id}-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({
        title: t("dashboard.branchManager.reports.title"),
        description: t("dashboard.branchManager.reports.generated", "Report generated successfully."),
      });
    } catch (error) {
      toast({
        title: t("dashboard.branchManager.reports.title"),
        description: error?.customMessage || t("dashboard.branchManager.reports.generateFailed", "Could not generate the report."),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('dashboard.branchManager.reports.title')}</h2>
          <p className="text-gray-400 mt-1">
            {t('dashboard.branchManager.reports.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-lg border border-white/10 text-white flex flex-col">
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
                variant="outline"
                className="w-full bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={() => handleGenerateReport(report)}
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('dashboard.branchManager.reports.generate')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
