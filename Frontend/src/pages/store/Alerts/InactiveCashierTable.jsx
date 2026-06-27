import React from "react";
import { formatDateTime } from "@/utils/formateDate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const InactiveCashierTable = ({ cashiers }) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle />
          {t('storeModule.alerts.inactiveCashiers.title')}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {t('storeModule.alerts.inactiveCashiers.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                <TableHead className="text-white">{t('storeModule.alerts.inactiveCashiers.cashierName')}</TableHead>
                <TableHead className="text-white">{t('storeModule.alerts.inactiveCashiers.branch')}</TableHead>
                <TableHead className="text-right text-white">{t('storeModule.alerts.inactiveCashiers.lastActive')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashiers.length > 0 ? (
                cashiers.map((cashier, index) => (
                  <TableRow key={cashier.id || index} className="hover:bg-white/5 border-b-white/10">
                    <TableCell className="font-medium text-white">{cashier.fullName}</TableCell>
                    <TableCell className="text-gray-400">{cashier.branchName || "—"}</TableCell>
                    <TableCell className="text-right text-gray-400">
                      {cashier.lastLogin ? formatDateTime(cashier.lastLogin) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactiveCashierTable;
