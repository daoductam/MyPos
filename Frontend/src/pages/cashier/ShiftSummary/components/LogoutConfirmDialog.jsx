import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next";

const LogoutConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.cashier.logout')}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>{t('dashboard.cashier.logoutConfirmMessage')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('dashboard.cashier.logoutConfirmNote')}</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('dashboard.cashier.logout')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmDialog; 