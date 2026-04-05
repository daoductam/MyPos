import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TestimonialCarousel = () => {
  const { t } = useTranslation();
  const testimonialItems = t('testimonials.items', { returnObjects: true });
  const testimonials = testimonialItems.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    position: item.position,
    image: `/testimonial-${idx + 1}.jpg`,
    content: item.content,
    rating: [5, 5, 4, 5][idx],
    businessType: item.businessType,
    employeeCount: ['50+', '25-50', '10-25', '100+'][idx],
    yearsSince: [2, 1.5, 1, 3][idx],
  }));


  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section id="testimonials" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('testimonials.title')} <span className="text-emerald-400">{t('testimonials.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Large Quote Icon */}
          <div className="absolute -top-10 -left-10 text-emerald-500/10">
            <Quote className="w-32 h-32" />
          </div>

          {/* Testimonial Cards */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 relative z-10 h-full backdrop-blur-lg shadow-lg">
                    <div className="flex flex-col md:flex-row gap-8 h-full">
                      {/* Left Column - Image and Info */}
                      <div className="md:w-1/3 flex flex-col items-center md:items-start">
                        <div className="relative mb-4">
                          <div className="w-24 h-24 rounded-full bg-black/20 overflow-hidden relative">
                            {/* This would be an actual image in production */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-emerald-500/10"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-emerald-400">
                              {testimonial.name.charAt(0)}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1">
                            <Quote className="w-4 h-4" />
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-foreground text-center md:text-left">{testimonial.name}</h3>
                        <p className="text-muted-foreground mb-4 text-center md:text-left">{testimonial.position}</p>
                        
                        <div className="flex items-center space-x-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-white/20'}`} 
                            />
                          ))}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-300 mb-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{t('testimonials.business')}:</span>
                            <span>{testimonial.businessType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{t('testimonials.teamSize')}:</span>
                            <span>{testimonial.employeeCount} {t('testimonials.employees')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{t('testimonials.usingFor')}:</span>
                            <span>{testimonial.yearsSince} {t('testimonials.years')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Content */}
                      <div className="md:w-2/3 flex flex-col justify-center">
                        <div className="text-lg md:text-xl text-gray-300 italic mb-6 relative">
                          <p>"{testimonial.content}"</p>
                        </div>
                        
                        <div className="mt-auto">
                          <Button variant="outline" size="sm" className="text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300">
                            {t('testimonials.readFullStory')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setActiveIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-emerald-500 w-8' : 'bg-white/20'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrow Controls */}
          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 transition-colors z-20 backdrop-blur-lg"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 transition-colors z-20 backdrop-blur-lg"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400 mb-2">500+</p>
            <p className="text-gray-300">{t('testimonials.stats.happyCustomers')}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400 mb-2">98%</p>
            <p className="text-gray-300">{t('testimonials.stats.satisfaction')}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400 mb-2">$2.5B+</p>
            <p className="text-gray-300">{t('testimonials.stats.revenueProcessed')}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-400 mb-2">24/7</p>
            <p className="text-gray-300">{t('testimonials.stats.customerSupport')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;