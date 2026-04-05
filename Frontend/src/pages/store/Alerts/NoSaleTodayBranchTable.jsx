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

const NoSaleTodayBranchTable = ({ branches }) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle />
          {t('storeModule.alerts.noSaleBranches.title')}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {t('storeModule.alerts.noSaleBranches.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                <TableHead className="text-white">{t('storeModule.alerts.noSaleBranches.branchName')}</TableHead>
                <TableHead className="text-right text-white">{t('storeModule.alerts.noSaleBranches.lastSaleDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length > 0 ? (
                branches.map((branch, index) => (
                  <TableRow key={branch.id || index} className="hover:bg-white/5 border-b-white/10">
                    <TableCell className="font-medium text-white">{branch.name}</TableCell>
                    <TableCell className="text-right text-gray-400">
                      {branch.lastSaleDate ? formatDateTime(branch.lastSaleDate) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500 italic">
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

export default NoSaleTodayBranchTable;
