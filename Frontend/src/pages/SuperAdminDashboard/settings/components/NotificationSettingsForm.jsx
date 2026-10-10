import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Loader2 } from "lucide-react";
import { useSettingsState } from "./useSettingsState";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../components/ui/use-toast";

const getNotificationOptions = (t) => [
  { id: "newStore", label: t("superAdminModule.settings.notifications.newStore"), desc: t("superAdminModule.settings.notifications.newStoreDesc") },
  { id: "subscriptionRenewal", label: t("superAdminModule.settings.notifications.subscriptionRenewal"), desc: t("superAdminModule.settings.notifications.subscriptionRenewalDesc") },
  { id: "systemAlerts", label: t("superAdminModule.settings.notifications.systemAlerts"), desc: t("superAdminModule.settings.notifications.systemAlertsDesc") },
];

export default function NotificationSettingsForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useSettingsState({
    newStore: true,
    subscriptionRenewal: true,
    systemAlerts: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);
  
  const notificationOptions = React.useMemo(() => getNotificationOptions(t), [t]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    try {
      const saved = localStorage.getItem("pos.super-admin.notification-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        ["newStore", "subscriptionRenewal", "systemAlerts"].forEach((key) => {
          if (typeof parsed[key] === "boolean") setNotifications(key, parsed[key]);
        });
      }
    } catch {
      toast({
        title: t("superAdminModule.settings.notifications.save"),
        description: t("superAdminModule.settings.notifications.loadError", "Saved notification preferences could not be loaded."),
        variant: "destructive",
      });
    }
  }, [setNotifications, t, toast]);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem("pos.super-admin.notification-settings", JSON.stringify(notifications));
      toast({
        title: t("superAdminModule.settings.notifications.save"),
        description: t("superAdminModule.settings.notifications.saveSuccess", "Notification preferences saved in this browser."),
      });
    } catch {
      toast({
        title: t("superAdminModule.settings.notifications.save"),
        description: t("superAdminModule.settings.notifications.saveError", "Notification preferences could not be saved."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      <div className="space-y-4 rounded-lg border border-white/10 p-4 bg-black/10">
        {notificationOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between space-x-2">
            <Label htmlFor={option.id} className="flex flex-col space-y-1">
              <span className="font-medium text-white">{option.label}</span>
              <span className="text-xs font-normal text-gray-400">
                {option.desc}
              </span>
            </Label>
            <Switch id={option.id} checked={notifications[option.id]} onCheckedChange={(checked) => setNotifications(option.id, checked)} />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-40 bg-emerald-600 hover:bg-emerald-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('superAdminModule.settings.notifications.save')}
        </Button>
      </div>
    </form>
  );
}
