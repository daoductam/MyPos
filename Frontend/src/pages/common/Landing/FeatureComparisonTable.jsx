import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

const featureAvailability = [
  { basic: [true, true, true, true, true] },
  { basic: [false, false, false, false, false], pro: [true, true, true, true, true] },
  { basic: [false, false, false, false, false], pro: [false, false, false, false, false], enterprise: [true, true, true, true, true] },
];

const FeatureComparisonTable = () => {
  const { t } = useTranslation();
  const categories = t('comparison.categories', { returnObjects: true });

  const availability = [
    categories[0].features.map(() => ({ basic: true, pro: true, enterprise: true })),
    categories[1].features.map(() => ({ basic: false, pro: true, enterprise: true })),
    categories[2].features.map(() => ({ basic: false, pro: false, enterprise: true })),
  ];

  const renderAvailability = (available) =>
    available ? (
      <CheckCircle className="w-5 h-5 text-emerald-400" />
    ) : (
      <X className="w-5 h-5 text-white/30" />
    );

  return (
    <div>
      <div className="hidden md:grid grid-cols-4 gap-4 px-6 pb-4 text-center font-medium text-gray-300 border-b border-white/10">
        <div className="text-left">{t('comparison.feature')}</div>
        <div>{t('comparison.basic')}</div>
        <div className="text-emerald-400">{t('comparison.pro')}</div>
        <div>{t('comparison.enterprise')}</div>
      </div>
      <Accordion type="multiple" className="w-full" defaultValue={['item-0']}>
        {categories.map((category, categoryIndex) => (
          <AccordionItem key={categoryIndex} value={`item-${categoryIndex}`} className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline bg-white/5 my-2 rounded-lg text-white font-semibold text-lg hover:bg-white/10">
              {category.name}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-2 pt-2 text-gray-300">
              <div className="space-y-2">
                {category.features.map((featureName, featureIndex) => {
                  const avail = availability[categoryIndex][featureIndex];
                  return (
                    <div key={featureIndex} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center py-3 border-b border-white/10">
                      <div className="col-span-2 md:col-span-1">{featureName}</div>
                      <div className="flex justify-end md:justify-center">
                        <span className="md:hidden text-gray-400 mr-2">{t('comparison.basic')}: </span>
                        {renderAvailability(avail.basic)}
                      </div>
                      <div className="flex justify-end md:justify-center">
                        <span className="md:hidden text-gray-400 mr-2">{t('comparison.pro')}: </span>
                        {renderAvailability(avail.pro)}
                      </div>
                      <div className="flex justify-end md:justify-center">
                        <span className="md:hidden text-gray-400 mr-2">{t('comparison.enterprise')}: </span>
                        {renderAvailability(avail.enterprise)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FeatureComparisonTable;