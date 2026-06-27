import { formatDate, getStatusColor, formatCurrency } from "./data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { PrinterIcon } from "lucide-react";
import { RotateCcwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const OrderTable = ({
  orders,
  handleViewOrder,
  handlePrintInvoice,
  handleInitiateReturn,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.orderId')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.date')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.customer')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.total')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.payment')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.status')}</TableHead>
          <TableHead className="text-right text-gray-400">{t('dashboard.branchManager.orders.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-16 text-gray-400">
              {t('dashboard.cashier.customerDialog.loading')}
            </TableCell>
          </TableRow>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <TableRow key={order.id} className="border-white/10">
              <TableCell className="font-medium text-white">#{order.id}</TableCell>
              <TableCell className="text-gray-300">{formatDate(order.createdAt)}</TableCell>
              <TableCell className="text-gray-300">
                {order.customer?.fullName || t('dashboard.cashier.paymentDialog.walkInCustomer')}
              </TableCell>
              <TableCell className="font-medium text-emerald-400">VNĐ {formatCurrency(order.totalAmount)}</TableCell>
              <TableCell className="text-gray-300">
                {order.paymentType ? t(`dashboard.cashier.paymentDialog.methods.${order.paymentType}`) : t('common.unknown')}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(order.status)} bg-opacity-20 border border-opacity-30 capitalize`}
                >
                  {order.status ? t(`dashboard.branchManager.orders.status.${order.status.toLowerCase()}`) : t('dashboard.branchManager.orders.status.completed')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)} className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(order)} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleInitiateReturn(order)} className="bg-transparent border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300">
                    <RotateCcwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-16 text-gray-400">
              <h3 className="text-xl font-semibold">{t('dashboard.cashier.orderHistory.noOrders')}</h3>
              <p className="mt-2">{t('dashboard.cashier.orderHistory.noOrdersDesc')}</p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
