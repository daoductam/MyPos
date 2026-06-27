import React from 'react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, HelpCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const supportIcons = [
  <Phone className="w-5 h-5" />,
  <Mail className="w-5 h-5" />,
  <MessageCircle className="w-5 h-5" />,
  <HelpCircle className="w-5 h-5" />,
];

const FAQSection = () => {
  const { t } = useTranslation();
  const faqs = t('faq.items', { returnObjects: true });
  const support = t('faq.support', { returnObjects: true });

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('faq.title')} <span className="text-emerald-400">{t('faq.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg shadow-lg">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-white/10 text-white font-medium">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-2 text-gray-300">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">{t('faq.stillHaveQuestions')}</p>
              <Button variant="outline" className="group border-white/30 text-white hover:bg-white/10">
                {t('faq.contactSupport')}
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          
          <div className="lg:sticky lg:top-24">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6">{t('faq.supportOptions')}</h3>
              
              <div className="space-y-4">
                {support.map((option, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 shadow-sm border border-white/10">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        {supportIcons[index]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{option.title}</h4>
                        <p className="text-sm text-gray-300 mb-1">{option.desc}</p>
                        <p className="text-sm font-medium text-white mb-3">{option.action}</p>
                        <Button variant="outline" size="sm" className="w-full justify-center border-white/20 text-white hover:bg-white/10">
                          {option.btn}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium text-white mb-2">{t('faq.businessHours')}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('faq.monFri')}</span>
                    <span className="font-medium text-white">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('faq.sat')}</span>
                    <span className="font-medium text-white">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('faq.sun')}</span>
                    <span className="font-medium text-white">{t('faq.closed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;