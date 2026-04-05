import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Loader2 } from "lucide-react";
import { useSettingsState } from "./useSettingsState";
import { useTranslation } from "react-i18next";

const getNotificationOptions = (t) => [
  { id: "newStore", label: t("superAdminModule.settings.notifications.newStore"), desc: t("superAdminModule.settings.notifications.newStoreDesc") },
  { id: "subscriptionRenewal", label: t("superAdminModule.settings.notifications.subscriptionRenewal"), desc: t("superAdminModule.settings.notifications.subscriptionRenewalDesc") },
  { id: "systemAlerts", label: t("superAdminModule.settings.notifications.systemAlerts"), desc: t("superAdminModule.settings.notifications.systemAlertsDesc") },
];

export default function NotificationSettingsForm() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useSettingsState({
    newStore: true,
    subscriptionRenewal: true,
    systemAlerts: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const notificationOptions = React.useMemo(() => getNotificationOptions(t), [t]);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("Saving notification settings:", notifications);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
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
