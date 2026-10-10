import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Loader2 } from "lucide-react";
import { useSettingsState } from "./useSettingsState";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../components/ui/use-toast";
import api from "../../../../utils/api";

export default function SystemSettingsForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [system, setSystem] = useSettingsState({
    maintenanceMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const loadSettings = async () => {
      try {
        const response = await api.get("/api/v1/platform/settings");
        if (typeof response.data?.maintenanceMode === "boolean") {
          setSystem("maintenanceMode", response.data.maintenanceMode);
        }
      } catch (error) {
        toast({
          title: t("superAdminModule.settings.system.save"),
          description: error?.customMessage || t("superAdminModule.settings.system.loadError", "System preferences could not be loaded."),
          variant: "destructive",
        });
      }
    };
    loadSettings();
  }, [setSystem, t, toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/api/v1/platform/settings", { maintenanceMode: system.maintenanceMode });
      toast({
        title: t("superAdminModule.settings.system.save"),
        description: t("superAdminModule.settings.system.saveSuccess", "System preferences saved."),
      });
    } catch (error) {
      toast({
        title: t("superAdminModule.settings.system.save"),
        description: error?.customMessage || t("superAdminModule.settings.system.saveError", "System preferences could not be saved."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      <div className="space-y-4 rounded-lg border border-white/10 p-4 bg-black/10">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
            <span className="font-medium text-white">{t('superAdminModule.settings.system.maintenanceMode')}</span>
            <p className="text-xs font-normal text-gray-400">
              {t('superAdminModule.settings.system.maintenanceModeDesc')}
            </p>
          </Label>
          <Switch
            id="maintenance-mode"
            checked={system.maintenanceMode}
            onCheckedChange={(checked) => setSystem("maintenanceMode", checked)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-48 bg-emerald-600 hover:bg-emerald-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('superAdminModule.settings.system.save')}
        </Button>
      </div>
    </form>
  );
}
