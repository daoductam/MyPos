import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { useTranslation } from "react-i18next";

const StoreInformation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { store, loading } = useSelector((state) => state.store);
  const [formData, setFormData] = useState({
    brand: "",
    storeType: "",
    address: "",
  });

  useEffect(() => {
    if (store) {
      setFormData({
        brand: store.brand || "",
        storeType: store.storeType || "",
        address: store.address || "",
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateStore({ id: store.id, storeData: formData })).unwrap();
      toast({ title: t('toast.success'), description: t('storeModule.settings.storeInfo.updateSuccess') });
    } catch (err) {
      toast({
        title: t('toast.error'),
        description: err.message || t('toast.fetchError'),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brand" className="text-gray-300">{t('storeModule.settings.storeInfo.storeName')}</Label>
        <Input
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storeType" className="text-gray-300">{t('storeModule.settings.storeInfo.storeType')}</Label>
        <Input
          id="storeType"
          name="storeType"
          value={formData.storeType}
          onChange={handleChange}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-300">{t('storeModule.settings.storeInfo.address')}</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="w-32 bg-emerald-600 hover:bg-emerald-500">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('storeModule.settings.storeInfo.saveChanges')}
        </Button>
      </div>
    </form>
  );
};

export default StoreInformation;
