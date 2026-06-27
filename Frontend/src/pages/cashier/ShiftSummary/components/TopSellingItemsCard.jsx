import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from "react-i18next";
import { formatVND } from '../../../../utils/formatCurrency';

const TopSellingItemsCard = ({ shiftData }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.cashier.shiftSummary.cards.topProducts')}</h2>
        <div className="space-y-3">
          {shiftData.topSellingProducts?.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-bold">VNĐ {formatVND(item.sellingPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('dashboard.cashier.shiftSummary.unitsSold', { count: item.quantity })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingItemsCard; 