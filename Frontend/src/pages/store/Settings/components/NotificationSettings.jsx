import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";
import { useTranslation } from "react-i18next";

const NotificationSettings = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const notificationOptions = [
    {
      name: "emailNotifications",
      title: t('storeModule.settings.notifications.email'),
      description: t('storeModule.settings.notifications.emailDesc')
    },
    {
      name: "smsNotifications",
      title: t('storeModule.settings.notifications.sms'),
      description: t('storeModule.settings.notifications.smsDesc')
    },
    {
      name: "lowStockAlerts",
      title: t('storeModule.settings.notifications.lowStock'),
      description: t('storeModule.settings.notifications.lowStockDesc')
    },
    {
      name: "salesReports",
      title: t('storeModule.settings.notifications.salesReports'),
      description: t('storeModule.settings.notifications.salesReportsDesc')
    },
    {
      name: "employeeActivity",
      title: t('storeModule.settings.notifications.employeeActivity'),
      description: t('storeModule.settings.notifications.employeeActivityDesc')
    }
  ];

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    onChange(name, checked);
  };

  return (
    <Card id="notification-settings">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-emerald-500" />
          {t('storeModule.settings.notifications.title')}
        </CardTitle>
        <CardDescription>
          {t('storeModule.settings.notifications.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.name} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">{option.title}</h4>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <ToggleSwitch
                name={option.name}
                checked={settings[option.name]}
                onChange={handleToggleChange}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 