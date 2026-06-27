import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getStoreAlerts } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LowStockProductTable from "./LowStockProductTable";
import NoSaleTodayBranchTable from "./NoSaleTodayBranchTable";
import InactiveCashierTable from "./InactiveCashierTable";
import RefundSpikeTable from "./RefundSpikeTable";

const Alerts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { storeAlerts, loading, error } = useSelector((state) => state.storeAnalytics);
  const { store } = useSelector((state) => state.store);

  useEffect(() => {
    if (store?.storeAdmin?.id) {
      dispatch(getStoreAlerts(store.storeAdmin.id));
    }
  }, [dispatch, store]);

  if (loading && !storeAlerts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('toast.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('storeModule.alerts.title')}</h2>
        <p className="text-gray-400">
          {t('storeModule.alerts.subtitle')}
        </p>
      </div>
      <div className="space-y-6">
        <LowStockProductTable products={storeAlerts?.lowStockAlerts || []} />
        <NoSaleTodayBranchTable branches={storeAlerts?.noSalesToday || []} />
        <InactiveCashierTable cashiers={storeAlerts?.inactiveCashiers || []} />
        <RefundSpikeTable spikes={storeAlerts?.refundSpikeAlerts || []} />
      </div>
    </div>
  );
};

export default Alerts;
