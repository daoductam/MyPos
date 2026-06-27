import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTime } from '../../../../utils/formateDate';
import { getPaymentIcon } from '../../../../utils/getPaymentIcon';
import { getPaymentMethodLabel } from '../../../../utils/paymentMethodLable';
import { useTranslation } from "react-i18next";
import { formatVND } from '../../../../utils/formatCurrency';

const RecentOrdersCard = ({ shiftData }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.cashier.shiftSummary.cards.recentOrders')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dashboard.branchManager.orders.table.orderId')}</TableHead>
              <TableHead>{t('dashboard.branchManager.orders.table.date')}</TableHead>
              <TableHead>{t('dashboard.branchManager.orders.table.payment')}</TableHead>
              <TableHead className="text-right">{t('dashboard.branchManager.orders.table.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shiftData.recentOrders?.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{formatTime(order.createdAt)}</TableCell>
                <TableCell className="flex items-center gap-1">
                 {order.paymentType? <>
                       {getPaymentIcon(order.paymentType)}
                  <span>{t(`dashboard.cashier.paymentDialog.methods.${order.paymentType}`)}</span>
                  </>: t('common.unknown')
             }
                </TableCell>
                <TableCell className="text-right">VNĐ {formatVND(order.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard; 