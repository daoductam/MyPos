import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import {
  ShiftInformationCard,
  SalesSummaryCard,
  PaymentSummaryCard,
  TopSellingItemsCard,
  RecentOrdersCard,
  RefundsCard,
  ShiftHeader,
  LogoutConfirmDialog,
  PrintDialog
} from './components';
import { getCurrentShiftProgress, endShift } from '../../../Redux Toolkit/features/shiftReport/shiftReportThunks';
import { logout } from '../../../Redux Toolkit/features/user/userThunks';
import { useNavigate } from 'react-router';
import { useTranslation } from "react-i18next";

const ShiftSummaryPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const navigate=useNavigate()

  const { currentShift, loading, error } = useSelector((state) => state.shiftReport);

  useEffect(() => {
    dispatch(getCurrentShiftProgress());
  }, [dispatch]);

  const handlePrintSummary = () => {
    setShowPrintDialog(false);
    toast({
      title: t('dashboard.cashier.shiftSummary.toast.printing'),
      description: t('dashboard.cashier.shiftSummary.toast.printingDesc'),
    });
  };

  const handleEndShift = async () => {
    setShowLogoutConfirmDialog(false);
    if (true) {
       dispatch(endShift());
       dispatch(logout())
       navigate("/")
      toast({
        title: t('dashboard.cashier.shiftSummary.toast.ended'),
        description: t('dashboard.cashier.shiftSummary.toast.endedDesc'),
      });
      
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ShiftHeader 
        onPrintClick={() => setShowPrintDialog(true)}
        onEndShiftClick={() => setShowLogoutConfirmDialog(true)}
      />
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-lg">{t('dashboard.cashier.shiftSummary.loading')}</div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-destructive">{error}</div>
        ) : currentShift ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ShiftInformationCard shiftData={currentShift} />
              <SalesSummaryCard shiftData={currentShift} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <PaymentSummaryCard shiftData={currentShift} />
              <TopSellingItemsCard shiftData={currentShift} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecentOrdersCard shiftData={currentShift} />
              <RefundsCard shiftData={currentShift} />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">{t('dashboard.cashier.shiftSummary.noData')}</div>
        )}
      </div>
      <LogoutConfirmDialog 
        isOpen={showLogoutConfirmDialog}
        onClose={() => setShowLogoutConfirmDialog(false)}
        onConfirm={handleEndShift}
      />
      <PrintDialog 
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onConfirm={handlePrintSummary}
      />
    </div>
  );
};

export default ShiftSummaryPage;