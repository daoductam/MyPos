import React, { useState } from "react";
import { useSelector } from "react-redux";
import { User, Store, Shield, Bell } from "lucide-react";
import StoreInformation from "../storeInformation/StoreInformation";
import ProfileSettingsForm from "../../SuperAdminDashboard/settings/components/ProfileSettingsForm";
import SecuritySettingsForm from "../../SuperAdminDashboard/settings/components/SecuritySettingsForm";
import NotificationSettings from "./components/NotificationSettings";
import { useTranslation } from "react-i18next";

const defaultNotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  lowStockAlerts: true,
  salesReports: true,
  employeeActivity: false,
};

const Settings = () => {
  const { t } = useTranslation();
  const { userProfile } = useSelector((state) => state.user);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);

  React.useEffect(() => {
    if (!userProfile?.id) return;
    const storageKey = `store-notification-settings:${userProfile.id}`;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved) setNotificationSettings({ ...defaultNotificationSettings, ...saved });
    } catch {
      setNotificationSettings(defaultNotificationSettings);
    }
  }, [userProfile?.id]);

  const handleNotificationChange = (name, value) => {
    setNotificationSettings((current) => {
      const updated = { ...current, [name]: value };
      if (userProfile?.id) {
        localStorage.setItem(`store-notification-settings:${userProfile.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const settingsTabs = [
    { id: 'store', name: t('storeModule.settings.tabs.storeDetails'), icon: <Store className="w-5 h-5" />, component: <StoreInformation /> },
    { id: 'profile', name: t('storeModule.settings.tabs.myProfile'), icon: <User className="w-5 h-5" />, component: <ProfileSettingsForm userProfile={userProfile} /> },
    { id: 'security', name: t('storeModule.settings.tabs.security'), icon: <Shield className="w-5 h-5" />, component: <SecuritySettingsForm /> },
    { id: 'notifications', name: t('storeModule.settings.tabs.notifications'), icon: <Bell className="w-5 h-5" />, component: <NotificationSettings settings={notificationSettings} onChange={handleNotificationChange} /> },
  ];

  const [activeTab, setActiveTab] = useState('store');

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('storeModule.settings.title')}</h2>
        <p className="text-gray-400">
          {t('storeModule.settings.subtitle')}
        </p>
      </div>

      <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-0 lg:grid lg:grid-cols-12 lg:gap-0 overflow-hidden">
        <aside className="px-4 py-6 lg:col-span-3 lg:border-r lg:border-white/10">
          <nav className="space-y-1">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {React.cloneElement(tab.icon, { className: `mr-3 h-5 w-5 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}` })}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 p-6 lg:p-8">
          {ActiveComponent}
        </div>
      </div>
    </div>
  );
};

export default Settings;
