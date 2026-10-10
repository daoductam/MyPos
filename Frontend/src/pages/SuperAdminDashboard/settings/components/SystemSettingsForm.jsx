import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Loader2 } from "lucide-react";
import { useSettingsState } from "./useSettingsState";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../components/ui/use-toast";

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
    try {
      const saved = localStorage.getItem("pos.super-admin.system-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.maintenanceMode === "boolean") {
          setSystem("maintenanceMode", parsed.maintenanceMode);
        }
      }
    } catch {
      toast({
        title: t("superAdminModule.settings.system.save"),
        description: t("superAdminModule.settings.system.loadError", "Saved system preferences could not be loaded."),
        variant: "destructive",
      });
    }
  }, [setSystem, t, toast]);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem("pos.super-admin.system-settings", JSON.stringify(system));
      toast({
        title: t("superAdminModule.settings.system.save"),
        description: t("superAdminModule.settings.system.saveSuccess", "System preferences saved in this browser."),
      });
    } catch {
      toast({
        title: t("superAdminModule.settings.system.save"),
        description: t("superAdminModule.settings.system.saveError", "System preferences could not be saved."),
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
