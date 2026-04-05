import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import StoreSettingsForm from "./StoreSettingsForm";
import { getInitialValues } from "./formUtils";
import { useTranslation } from "react-i18next";

const StoreSettings = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { store, loading, error } = useSelector((state) => state.store);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (apiData, { setSubmitting, resetForm }) => {
    if (!store?.id) {
      toast({
        title: t('toast.error'),
        description: t('toast.fetchError'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateStore({ 
        id: store.id, 
        storeData: apiData
      })).unwrap();
      
      toast({
        title: t('toast.success'),
        description: t('storeModule.settings.storeInfo.updateSuccess'),
      });
      
      // Update local settings state
      Object.keys(settings).forEach(key => {
        onChange(key, settings[key]);
      });
      
      resetForm({ values: getInitialValues(store) });
    } catch (err) {
      toast({
        title: t('toast.error'),
        description: err || t('toast.fetchError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <Card id="store-settings">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Store className="mr-2 h-5 w-5 text-emerald-500" />
          {t('storeModule.settings.storeInfo.title') || t('storeModule.settings.tabs.storeDetails')}
        </CardTitle>
        <CardDescription>
          {t('storeModule.settings.storeInfo.desc') || t('storeModule.settings.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StoreSettingsForm
          initialValues={settings}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting || loading}
          storeId={store?.id}
        />
      </CardContent>
    </Card>
  );
};

export default StoreSettings; 