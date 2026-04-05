import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const EmployeeStats = ({ employees }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-400">
              {t('dashboard.branchManager.dashboard.stats.totalEmployees')}
            </h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">{employees.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-400">
              {t('dashboard.branchManager.dashboard.stats.activeEmployees')}
            </h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">
              {employees.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-400">
              {t('dashboard.branchManager.dashboard.stats.cashiers')}
            </h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">
              {
                employees.filter(
                  (e) => e.role === "ROLE_BRANCH_CASHIER"
                ).length
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;