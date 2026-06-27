import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { FileText, BarChart2, Users, Package, Download, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";

const Reports = () => {
  const { t } = useTranslation();

  const reportTypes = [
    {
      title: t('storeModule.reports.types.overallSales.title'),
      description: t('storeModule.reports.types.overallSales.desc'),
      icon: <BarChart2 className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: t('storeModule.reports.types.branchPerformance.title'),
      description: t('storeModule.reports.types.branchPerformance.desc'),
      icon: <GitBranch className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: t('storeModule.reports.types.productPerformance.title'),
      description: t('storeModule.reports.types.productPerformance.desc'),
      icon: <Package className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: t('storeModule.reports.types.employeeSales.title'),
      description: t('storeModule.reports.types.employeeSales.desc'),
      icon: <Users className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: t('storeModule.reports.types.inventorySummary.title'),
      description: t('storeModule.reports.types.inventorySummary.desc'),
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: t('storeModule.reports.types.taxReport.title'),
      description: t('storeModule.reports.types.taxReport.desc'),
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('storeModule.reports.title')}</h2>
        <p className="text-gray-400">
          {t('storeModule.reports.subtitle')}
        </p>
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
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                {t('storeModule.reports.generateReport')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
