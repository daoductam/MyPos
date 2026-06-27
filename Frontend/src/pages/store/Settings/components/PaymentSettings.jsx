import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";
import { useTranslation } from "react-i18next";

const PaymentSettings = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const paymentOptions = [
    {
      name: "acceptCash",
      title: t('storeModule.settings.payment.acceptCash'),
      description: t('storeModule.settings.payment.acceptCashDesc')
    },
    {
      name: "acceptCredit",
      title: t('storeModule.settings.payment.acceptCredit'),
      description: t('storeModule.settings.payment.acceptCreditDesc')
    },
    {
      name: "acceptDebit",
      title: t('storeModule.settings.payment.acceptDebit'),
      description: t('storeModule.settings.payment.acceptDebitDesc')
    },
    {
      name: "acceptMobile",
      title: t('storeModule.settings.payment.acceptMobile'),
      description: t('storeModule.settings.payment.acceptMobileDesc')
    },
    {
      name: "stripeEnabled",
      title: t('storeModule.settings.payment.stripe'),
      description: t('storeModule.settings.payment.stripeDesc')
    },
    {
      name: "paypalEnabled",
      title: t('storeModule.settings.payment.paypal'),
      description: t('storeModule.settings.payment.paypalDesc')
    }
  ];

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    onChange(name, checked);
  };

  return (
    <Card id="payment-settings">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-emerald-500" />
          {t('storeModule.settings.payment.title')}
        </CardTitle>
        <CardDescription>
          {t('storeModule.settings.payment.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentOptions.map((option) => (
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

export default PaymentSettings; 