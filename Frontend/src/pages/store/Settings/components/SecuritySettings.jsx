import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";
import { useTranslation } from "react-i18next";

const SecuritySettings = ({ settings, onChange }) => {
  const { t } = useTranslation();

  const securityOptions = [
    {
      name: "twoFactorAuth",
      title: t('storeModule.settings.security.twoFactorAuth'),
      description: t('storeModule.settings.security.twoFactorAuthDesc')
    },
    {
      name: "ipRestriction",
      title: t('storeModule.settings.security.ipRestriction'),
      description: t('storeModule.settings.security.ipRestrictionDesc')
    }
  ];

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    onChange(name, checked);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <Card id="security-settings">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-emerald-500" />
          {t('storeModule.settings.security.title')}
        </CardTitle>
        <CardDescription>
          {t('storeModule.settings.security.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityOptions.map((option) => (
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="passwordExpiry" className="text-sm font-medium">
                {t('storeModule.settings.security.passwordExpiry')}
              </label>
              <Input
                id="passwordExpiry"
                name="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sessionTimeout" className="text-sm font-medium">
                {t('storeModule.settings.security.sessionTimeout')}
              </label>
              <Input
                id="sessionTimeout"
                name="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings; 