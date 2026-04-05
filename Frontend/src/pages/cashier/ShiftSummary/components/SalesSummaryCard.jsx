import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from "react-i18next";
import { formatVND } from '../../../../utils/formatCurrency';

const SalesSummaryCard = ({ shiftData }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.cashier.shiftSummary.cards.sales')}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.totalOrders')}:</span>
            <span className="font-medium">{shiftData.totalOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.totalSales')}:</span>
            <span className="font-medium">VNĐ {formatVND(shiftData.totalSales)}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>{t('dashboard.cashier.shiftSummary.totalRefunds')}:</span>
            <span>-VNĐ {formatVND(shiftData.totalRefunds)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>{t('dashboard.cashier.shiftSummary.netSales')}:</span>
            <span>VNĐ {formatVND(shiftData.netSales)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryCard; 