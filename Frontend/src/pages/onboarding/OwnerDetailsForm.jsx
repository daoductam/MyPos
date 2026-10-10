import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const OwnerDetailsForm = ({ initialValues, onSubmit, mousePosition }) => {
const OwnerDetailsForm = ({ initialValues, onSubmit, onBack, mousePosition }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [visibleFields, setVisibleFields] = useState([]);

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required(t('auth.onboarding.validation.fullNameRequired'))
      .min(2, t('auth.onboarding.validation.fullNameMin')),
    email: Yup.string()
      .email(t('auth.onboarding.validation.emailInvalid'))
      .required(t('auth.onboarding.validation.emailRequired')),
    password: Yup.string()
      .min(6, t('auth.onboarding.validation.passwordMin'))
      .required(t('auth.onboarding.validation.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], t('auth.onboarding.validation.passwordMismatch'))
      .required(t('auth.onboarding.validation.confirmPasswordRequired')),
  });
  const validationSchema = useMemo(() => Yup.object({
    fullName: Yup.string()
      .required(t('onboarding.ownerForm.validation.fullNameRequired'))
      .min(2, t('onboarding.ownerForm.validation.fullNameMin')),
    email: Yup.string()
      .email(t('onboarding.ownerForm.validation.emailInvalid'))
      .required(t('onboarding.ownerForm.validation.emailRequired')),
    password: Yup.string()
      .min(6, t('onboarding.ownerForm.validation.passwordMin'))
      .required(t('onboarding.ownerForm.validation.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], t('onboarding.ownerForm.validation.passwordMatch'))
      .required(t('onboarding.ownerForm.validation.confirmRequired')),
  }), [t]);

  useEffect(() => {
    const fields = ['fullName', 'email', 'password', 'confirmPassword', 'submit'];
    const timeouts = fields.map((field, index) => 
      setTimeout(() => {
        setVisibleFields(prev => [...prev, field]);
      }, index * 100)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, touched, errors }) => (
        <Form className="space-y-6">
      {({ isSubmitting, isValid, touched, errors }) => (
        <Form className="space-y-4 text-left">
          {/* Full Name Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('fullName') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * 1}px) translateY(${mousePosition.y * 1}px)` }}>
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.ownerForm.fullNameLabel')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Input}
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`w-full pl-11 pr-4 h-12 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 ${
                    touched.fullName && errors.fullName 
                      ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' 
                      : 'border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  placeholder={t('auth.onboarding.owner.fullNamePlaceholder')}
                  placeholder={t('onboarding.ownerForm.fullNamePlaceholder')}
                  autoComplete="name"
                />
              </div>
              <ErrorMessage name="fullName">
                {msg => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Email Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('email') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * -1.5}px) translateY(${mousePosition.y * -1.5}px)` }}>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.ownerForm.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Input}
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full pl-11 pr-4 h-12 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 ${
                    touched.email && errors.email 
                      ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' 
                      : 'border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  placeholder={t('auth.onboarding.owner.emailPlaceholder')}
                  placeholder={t('onboarding.ownerForm.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>
              <ErrorMessage name="email">
                {msg => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Password Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('password') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * 2}px) translateY(${mousePosition.y * 2}px)` }}>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.ownerForm.passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Input}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`w-full pl-11 pr-11 h-12 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 ${
                    touched.password && errors.password 
                      ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' 
                      : 'border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  placeholder={t('auth.onboarding.owner.passwordPlaceholder')}
                  placeholder={t('onboarding.ownerForm.passwordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage name="password">
                {msg => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('confirmPassword') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * -1}px) translateY(${mousePosition.y * -1}px)` }}>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.ownerForm.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Input}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`w-full pl-11 pr-11 h-12 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 ${
                    touched.confirmPassword && errors.confirmPassword 
                      ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' 
                      : 'border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  placeholder={t('auth.onboarding.owner.confirmPasswordPlaceholder')}
                  placeholder={t('onboarding.ownerForm.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage name="confirmPassword">
                {msg => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Submit Button */}
          <div className={`pt-3 transition-all duration-500 ease-out ${visibleFields.includes('submit') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * 1.5}px) translateY(${mousePosition.y * 1.5}px)` }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full group flex items-center justify-center py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  {t('auth.onboarding.owner.processing')}
                </>
              ) : (
                <>
                  {t('auth.onboarding.owner.nextStep')}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 group flex items-center justify-center text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    {t('onboarding.ownerForm.processing')}
                  </>
                ) : (
                  <>
                    {t('onboarding.ownerForm.nextStep')}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OwnerDetailsForm; 
