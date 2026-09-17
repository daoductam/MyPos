import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Store, MapPin, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup, SelectLabel } from "../../components/ui/select";
import { useTranslation } from "react-i18next";

const StoreDetailsForm = ({ initialValues, onSubmit, onBack, mousePosition }) => {
  const { t } = useTranslation();
  const [visibleFields, setVisibleFields] = useState([]);

  const validationSchema = useMemo(() => Yup.object({
    storeName: Yup.string()
      .required(t('onboarding.storeForm.validation.storeNameRequired'))
      .min(2, t('onboarding.storeForm.validation.storeNameMin')),
    storeType: Yup.string().required(t('onboarding.storeForm.validation.storeTypeRequired')),
    storeAddress: Yup.string().optional(),
  }), [t]);

  const storeTypes = useMemo(() => [
    { value: "retail", label: t('onboarding.storeForm.types.retail') },
    { value: "restaurant", label: t('onboarding.storeForm.types.restaurant') },
    { value: "cafe", label: t('onboarding.storeForm.types.cafe') },
    { value: "pharmacy", label: t('onboarding.storeForm.types.pharmacy') },
    { value: "grocery", label: t('onboarding.storeForm.types.grocery') },
    { value: "electronics", label: t('onboarding.storeForm.types.electronics') },
    { value: "clothing", label: t('onboarding.storeForm.types.clothing') },
    { value: "other", label: t('onboarding.storeForm.types.other') },
  ], [t]);

  useEffect(() => {
    const fields = ['storeName', 'storeType', 'storeAddress', 'navigation'];
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
      {({ isSubmitting, isValid, touched, errors }) => (
        <Form className="space-y-4 text-left">
          {/* Store Name Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('storeName') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * 1}px) translateY(${mousePosition.y * 1}px)` }}>
              <label htmlFor="storeName" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.storeForm.storeNameLabel')}
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Input}
                  type="text"
                  id="storeName"
                  name="storeName"
                  className={`w-full pl-11 pr-4 h-12 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 ${
                    touched.storeName && errors.storeName
                      ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' 
                      : 'border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  placeholder={t('onboarding.storeForm.storeNamePlaceholder')}
                  autoComplete="organization"
                />
              </div>
              <ErrorMessage name="storeName">
                {(msg) => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Store Type Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('storeType') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * -1.5}px) translateY(${mousePosition.y * -1.5}px)` }}>
              <label htmlFor="storeType" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.storeForm.storeTypeLabel')}
              </label>
              <div>
                <Field name="storeType">
                  {({ form: { setFieldValue, values } }) => (
                    <Select
                      value={values.storeType}
                      onValueChange={(value) => setFieldValue("storeType", value)}
                    >
                      <SelectTrigger
                        className={`w-full h-12 text-left rounded-xl transition-all duration-200 text-white bg-white/5 border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                          !values.storeType && "text-gray-500"
                        } ${touched.storeType && errors.storeType ? 'border-red-500/80 ring-1 ring-red-500/30 bg-red-950/10' : ''}`}
                        id="storeType"
                      >
                        <SelectValue placeholder={t('onboarding.storeForm.storeTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 border border-white/15 text-white backdrop-blur-xl rounded-xl shadow-2xl">
                        <SelectGroup>
                          <SelectLabel className="text-gray-400 text-xs">{t('onboarding.storeForm.storeTypeLabel')}</SelectLabel>
                          {storeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="focus:bg-emerald-600/30 focus:text-emerald-300 cursor-pointer py-2.5">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              </div>
              <ErrorMessage name="storeType">
                {(msg) => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Store Address Field */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('storeAddress') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * 2}px) translateY(${mousePosition.y * 2}px)` }}>
              <label htmlFor="storeAddress" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                {t('onboarding.storeForm.storeAddressLabel')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                <Field
                  as={Textarea}
                  id="storeAddress"
                  name="storeAddress"
                  rows="3"
                  className="w-full pl-11 pr-4 py-3 rounded-xl transition-all duration-200 text-white placeholder-gray-500 bg-white/5 border border-white/15 hover:border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none outline-none"
                  placeholder={t('onboarding.storeForm.storeAddressPlaceholder')}
                  autoComplete="street-address"
                />
              </div>
              <ErrorMessage name="storeAddress">
                {(msg) => (
                  <div className="text-red-400 text-xs mt-1.5 flex items-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-400" />
                    <span>{msg}</span>
                  </div>
                )}
              </ErrorMessage>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className={`transition-all duration-500 ease-out ${visibleFields.includes('navigation') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 transition-transform duration-500 ease-out" style={{ transform: `translateX(${mousePosition.x * -1}px) translateY(${mousePosition.y * -1}px)` }}>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full sm:w-auto flex-1 h-12 group flex items-center justify-center text-base font-semibold border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                {t('onboarding.storeForm.back')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex-1 h-12 group flex items-center justify-center text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    {t('onboarding.storeForm.creating')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {t('onboarding.storeForm.complete')}
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

export default StoreDetailsForm;
