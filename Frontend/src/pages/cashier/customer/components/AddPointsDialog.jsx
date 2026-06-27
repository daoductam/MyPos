import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from "react-i18next";


const AddPointsDialog = ({ 
  isOpen, 
  onClose, 
  customer, 
  pointsToAdd, 
  onPointsChange, 
  onAddPoints 
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">{t('dashboard.cashier.customer.details.addPoints')}</DialogTitle>
          <DialogDescription className="sr-only">
            Add loyalty points to the customer's account.
          </DialogDescription>
        </DialogHeader>

        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p><span className="font-medium text-gray-400">{t('dashboard.cashier.customerDialog.table.name')}:</span> <span className="text-gray-200">{customer?.fullName || customer?.name}</span></p>
            <p><span className="font-medium text-gray-400">{t('dashboard.cashier.customer.details.currentPoints')}:</span> <span className="text-gray-200">{customer?.loyaltyPoints || 0}</span></p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="points" className="text-sm font-medium text-gray-300">{t('dashboard.cashier.customer.details.pointsToAdd')}</label>
            <Input
              id="points"
              type="number"
              min="1"
              value={pointsToAdd}
              onChange={(e) => onPointsChange(parseInt(e.target.value) || 0)}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">{t('common.cancel')}</Button>
          <Button onClick={onAddPoints} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">{t('dashboard.cashier.customer.details.addPoints')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPointsDialog; 