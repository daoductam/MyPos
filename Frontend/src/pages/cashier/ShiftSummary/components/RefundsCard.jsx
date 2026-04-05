import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { formatVND } from '../../../../utils/formatCurrency';

const RefundsCard = ({ shiftData }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.cashier.shiftSummary.cards.refunds')}</h2>
        {shiftData.refunds?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.branchManager.refunds.table.refundId')}</TableHead>
                <TableHead>{t('dashboard.branchManager.refunds.table.orderId')}</TableHead>
                <TableHead>{t('dashboard.branchManager.refunds.table.reason')}</TableHead>
                <TableHead className="text-right">{t('dashboard.branchManager.refunds.table.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftData.refunds.map(refund => (
                <TableRow key={refund.id}>
                  <TableCell className="font-medium">RFD-{refund.id}</TableCell>
                  <TableCell>ORD-{refund.orderId}</TableCell>
                  <TableCell>{t(`dashboard.cashier.return.reasons.${refund.reason?.toLowerCase()}`, { defaultValue: refund.reason })}</TableCell>
                  <TableCell className="text-right text-destructive">VNĐ {formatVND(refund.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CheckCircleIcon size={48} strokeWidth={1} />
            <p className="mt-4">{t('dashboard.cashier.shiftSummary.noRefunds')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RefundsCard; 