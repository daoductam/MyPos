import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";

const PrintDialog = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">{t('dashboard.cashier.shiftSummary.printTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-300">{t('dashboard.cashier.shiftSummary.printMessage')}</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <PrinterIcon className="h-4 w-4 mr-2" />
            {t('dashboard.cashier.invoiceDialog.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDialog; 