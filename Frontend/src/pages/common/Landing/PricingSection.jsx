import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useTranslation } from 'react-i18next';

const PricingSection = () => {
  const { t } = useTranslation();
  const plans = t('pricing.plans', { returnObjects: true });

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('pricing.title')}<span className="text-emerald-400">{t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-300">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg shadow-lg ${
                index === 1 ? "ring-2 ring-emerald-500 relative" : ""
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {index < 2 && (
                    <span className="text-gray-400 ml-1">
                      {t('pricing.perMonth')}
                    </span>
                  )}
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  index === 1 ? "bg-emerald-600 hover:bg-emerald-500" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {index === 2 ? t('pricing.contactSales') : t('pricing.getStarted')}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-4">
            {t('pricing.freeTrial')}
          </p>
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-lg">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300">
              {t('pricing.moneyBack')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
