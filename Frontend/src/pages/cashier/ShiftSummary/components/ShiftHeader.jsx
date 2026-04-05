import { PrinterIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';

const ShiftHeader = ({ onPrintClick, onEndShiftClick }) => {
  const { t } = useTranslation();

  
  return (
    <div className="p-4 bg-card border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('dashboard.cashier.shiftSummary.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrintClick}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            {t('dashboard.cashier.invoiceDialog.print')}
          </Button>
          <Button variant="destructive" onClick={onEndShiftClick}>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            {t('dashboard.cashier.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftHeader; 