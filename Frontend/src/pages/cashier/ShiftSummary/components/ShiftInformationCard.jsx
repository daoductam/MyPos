import { formatDateTime } from '../../../../utils/formateDate';
import { useTranslation } from "react-i18next";
import { Card, CardContent } from '@/components/ui/card';

const ShiftInformationCard = ({ shiftData }) => {
  const { t } = useTranslation();
  

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.cashier.shiftSummary.cards.information')}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.cashier')}:</span>
            <span className="font-medium">{shiftData.cashier.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.startTime')}:</span>
            <span>{formatDateTime(shiftData.shiftStart)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.endTime')}:</span>
            <span>{shiftData.shiftEnd ? formatDateTime(shiftData.shiftEnd) : t('dashboard.cashier.shiftSummary.ongoing')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dashboard.cashier.shiftSummary.duration')}:</span>
            <span>{shiftData.shiftDuration || "--"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftInformationCard; 