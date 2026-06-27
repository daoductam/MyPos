import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, ArrowUpDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const OrdersTable = ({ orders, loading, onViewDetails, onPrintInvoice, getStatusColor, getPaymentIcon }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="w-[100px] text-gray-400">
            <div className="flex items-center gap-1">
              {t('dashboard.branchManager.orders.table.id')}
              <ArrowUpDown className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.customer')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.cashier')}</TableHead>
          <TableHead className="text-gray-400">
            <div className="flex items-center gap-1">
              {t('dashboard.branchManager.orders.table.date')}
              <ArrowUpDown className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-gray-400">
            <div className="flex items-center gap-1">
              {t('dashboard.branchManager.orders.table.amount')}
              <ArrowUpDown className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.paymentMode')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.status')}</TableHead>
          <TableHead className="text-right text-gray-400">{t('dashboard.branchManager.orders.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-16">
              <div className="flex justify-center items-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-3" />
                {t('dashboard.branchManager.orders.table.loading')}
              </div>
            </TableCell>
          </TableRow>
        ) : orders.length > 0 ? (
          orders.map((order) => ( 
            <TableRow key={order.id} className="border-white/10">
              <TableCell className="font-medium text-white">{order.id}</TableCell>
              <TableCell className="text-gray-300">{order.customer?.fullName || "-"}</TableCell>
              <TableCell className="text-gray-300">{order.cashierId || "-"}</TableCell>
              <TableCell className="text-gray-300">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
              <TableCell className="text-emerald-400 font-medium">
                {order.totalAmount ? `VNĐ ${order.totalAmount.toLocaleString('vi-VN')}` : "-"}
              </TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  {getPaymentIcon(order.paymentType)} {order.paymentType || "-"}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {t(`dashboard.branchManager.orders.statusLabels.${order.status?.toLowerCase() || 'completed'}`)}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(order.id)}
                    title={t('dashboard.branchManager.orders.table.viewDetails')}
                    className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintInvoice(order.id)}
                    title={t('dashboard.branchManager.orders.table.printInvoice')}
                    className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-16 text-gray-400">
              <div className="text-center">
                <h3 className="text-xl font-semibold">{t('dashboard.branchManager.orders.table.noOrders')}</h3>
                <p className="mt-2">{t('dashboard.branchManager.orders.table.noOrdersDesc')}</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;