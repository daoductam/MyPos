import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchIcon } from "lucide-react";
import { formatDate } from "../../order/data";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const OrderTable = ({ handleSelectOrder }) => {
  const { t } = useTranslation();
  const {
    orders,
    loading,
    error
  } = useSelector((state) => state.order);
  return (
    <div className="w-full p-4 flex flex-col">
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <span>{t('dashboard.cashier.customerDialog.loading')}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
            <span>{error}</span>
          </div>
        ) : orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.branchManager.orders.table.orderId')}</TableHead>
                <TableHead>{t('dashboard.branchManager.orders.table.date')}</TableHead>
                <TableHead>{t('dashboard.branchManager.orders.table.customer')}</TableHead>
                <TableHead>{t('dashboard.branchManager.orders.table.total')}</TableHead>
                <TableHead>{t('dashboard.branchManager.orders.table.payment')}</TableHead>
                <TableHead className="text-right">{t('dashboard.branchManager.orders.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.customer?.fullName || t('dashboard.cashier.paymentDialog.walkInCustomer')}</TableCell>
                  <TableCell>VNĐ {order.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>{order.paymentType ? t(`dashboard.cashier.paymentDialog.methods.${order.paymentType}`) : t('common.unknown')}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleSelectOrder(order)}>
                      {t('dashboard.cashier.return.selectForReturn')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <SearchIcon size={48} strokeWidth={1} />
            <p className="mt-4">{t('dashboard.cashier.return.noOrders')}</p>
            <p className="text-sm">
              {t('dashboard.cashier.return.searchTip')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTable;
