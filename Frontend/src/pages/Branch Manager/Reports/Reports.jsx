import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Users, Package, Download } from "lucide-react";
import jsPDF from "jspdf";
import { useTranslation } from "react-i18next";

export default function Reports() {
  const { t } = useTranslation();

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

  const handleGenerateReport = (reportTitle) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`${reportTitle}`, 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.text(t('dashboard.branchManager.reports.placeholderText1'), 105, 30, null, null, "center");
    doc.text(t('dashboard.branchManager.reports.placeholderText2'), 105, 35, null, null, "center");

    doc.save(`${reportTitle.replace(/ /g, "_")}.pdf`);
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
                onClick={() => handleGenerateReport(report.title)}
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
