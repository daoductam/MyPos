import { BarChart3, Shield, Store, FileText, Users, ShoppingCart } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const icons = [
  <ShoppingCart className="w-8 h-8" />,
  <BarChart3 className="w-8 h-8" />,
  <Users className="w-8 h-8" />,
  <Shield className="w-8 h-8" />,
  <FileText className="w-8 h-8" />,
  <Store className="w-8 h-8" />,
]

const KeyFeaturesSection = () => {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true });

  return (
    <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((feature, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-8 transform hover:-translate-y-2 transition-transform duration-300 backdrop-blur-lg shadow-lg">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 text-emerald-400">
                  {icons[index]}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default KeyFeaturesSection