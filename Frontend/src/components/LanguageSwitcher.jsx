import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'en', label: '🇺🇸 English' },
];

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center space-x-2 ${
                i18n.language === lang.code
                  ? 'bg-emerald-600/20 text-emerald-400 font-medium'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{lang.label}</span>
              {i18n.language === lang.code && (
                <span className="ml-auto text-emerald-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
