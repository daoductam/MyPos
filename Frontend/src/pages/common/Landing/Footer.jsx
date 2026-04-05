import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900/50 text-white border-t border-white/10 relative overflow-hidden backdrop-blur-lg">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-md bg-emerald-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-white font-bold text-xl">POS Pro</span>
            </div>
            <p className="mb-4 text-gray-400 max-w-md">
              {t('footer.description')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.home')}</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">{t('header.features')}</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">{t('header.pricing')}</a></li>
              <li><a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">{t('header.testimonials')}</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">{t('header.contact')}</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.blog')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.helpCenter')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.documentation')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.apiReference')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.partners')}</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">support@pospro.com</span>
              </li>
              <li className="text-muted-foreground">
                <p>Capital Park, Gachibowli</p>
                <p>Hyderabad, Telangana 500032</p>
              </li>
              <li className="text-muted-foreground">
                <p>+91 98765 43210</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter and Socials */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="text-white font-medium text-lg mb-2">{t('footer.stayUpdated')}</h4>
            <p className="text-gray-400 mb-4">{t('footer.newsletterDesc')}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={t('footer.emailPlaceholder')} 
                className="bg-white/5 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-grow border border-white/20"
              />
              <Button className="rounded-l-none bg-emerald-600 hover:bg-emerald-500">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="md:text-right">
            <h4 className="text-white font-medium text-lg mb-4">{t('footer.followUs')}</h4>
            <div className="flex space-x-4 md:justify-end">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="bg-black/30 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-400">
              <p>&copy; {currentYear} POSPro. {t('footer.copyright')}</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;