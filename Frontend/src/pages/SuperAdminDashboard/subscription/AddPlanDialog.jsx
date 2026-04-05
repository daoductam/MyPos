// External dependencies
import React, { useState, memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// UI components
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Button } from '../../../components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';

// Redux thunks
import { createSubscriptionPlan } from '@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks';
import { useTranslation } from 'react-i18next';

// --- Constants ---
const getBillingCycles = (t) => [
  { label: t('superAdminModule.subscriptions.billingCycles.monthly'), value: 'MONTHLY' },
  { label: t('superAdminModule.subscriptions.billingCycles.yearly'), value: 'YEARLY' },
];

const FEATURE_FIELDS = [
  { key: 'enableAdvancedReports', labelKey: 'superAdminModule.subscriptions.features.advancedReports' },
  { key: 'enableInventory', labelKey: 'superAdminModule.subscriptions.features.inventory' },
  { key: 'enableIntegrations', labelKey: 'superAdminModule.subscriptions.features.integrations' },
  { key: 'enableEcommerce', labelKey: 'superAdminModule.subscriptions.features.ecommerce' },
  { key: 'enableInvoiceBranding', labelKey: 'superAdminModule.subscriptions.features.invoiceBranding' },
  { key: 'prioritySupport', labelKey: 'superAdminModule.subscriptions.features.prioritySupport' },
  { key: 'enableMultiLocation', labelKey: 'superAdminModule.subscriptions.features.multiLocation' },
];

const getValidationSchema = (t) => Yup.object().shape({
  name: Yup.string().required(t('superAdminModule.subscriptions.validation.nameRequired')),
  description: Yup.string().required(t('superAdminModule.subscriptions.validation.descRequired')),
  price: Yup.number().typeError(t('superAdminModule.subscriptions.validation.priceNumber')).required(t('superAdminModule.subscriptions.validation.priceRequired')).min(0),
  billingCycle: Yup.string().oneOf(['MONTHLY', 'YEARLY']).required(t('superAdminModule.subscriptions.validation.billingRequired')),
  maxBranches: Yup.number().typeError(t('superAdminModule.subscriptions.validation.branchesNumber')).required(t('superAdminModule.subscriptions.validation.branchesRequired')).min(1),
  maxUsers: Yup.number().typeError(t('superAdminModule.subscriptions.validation.usersNumber')).required(t('superAdminModule.subscriptions.validation.usersRequired')).min(1),
  maxProducts: Yup.number().typeError(t('superAdminModule.subscriptions.validation.productsNumber')).required(t('superAdminModule.subscriptions.validation.productsRequired')).min(1),
  enableAdvancedReports: Yup.boolean().required(),
  enableInventory: Yup.boolean().required(),
  enableIntegrations: Yup.boolean().required(),
  enableEcommerce: Yup.boolean().required(),
  enableInvoiceBranding: Yup.boolean().required(),
  prioritySupport: Yup.boolean().required(),
  enableMultiLocation: Yup.boolean().required(),
  extraFeatures: Yup.array().of(Yup.string().required(t('superAdminModule.subscriptions.validation.featureEmpty'))).min(1, t('superAdminModule.subscriptions.validation.featureAtLeastOne')),
});

const initialValues = {
  name: '',
  description: '',
  price: '',
  billingCycle: '',
  maxBranches: '',
  maxUsers: '',
  maxProducts: '',
  enableAdvancedReports: false,
  enableInventory: false,
  enableIntegrations: false,
  enableEcommerce: false,
  enableInvoiceBranding: false,
  prioritySupport: false,
  enableMultiLocation: false,
  extraFeatures: [''],
};

// --- Subcomponents ---

/**
 * Renders the feature switches grid.
 */
const FeaturesSwitchGrid = memo(({ handleFeatureSwitch, t }) => (
  <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-md">
    {FEATURE_FIELDS.map(f => (
      <label key={f.key} className="flex items-center gap-3 text-sm font-medium">
        <Field name={f.key} type="checkbox">
          {({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={val => handleFeatureSwitch(f.key, val)}
              id={f.key}
            />
          )}
        </Field>
        <span className="text-gray-300">{t(f.labelKey)}</span>
      </label>
    ))}
  </div>
));
FeaturesSwitchGrid.displayName = 'FeaturesSwitchGrid';

/**
 * Renders the extra features input list.
 */
const ExtraFeaturesList = memo(({ values, handleExtraFeatureChange, handleRemoveExtraFeature, handleAddExtraFeature, t }) => (
  <>
    {values.extraFeatures.map((feature, idx) => (
      <div key={idx} className="flex gap-2 mb-2">
        <Input
          value={feature}
          onChange={e => handleExtraFeatureChange(idx, e.target.value)}
          placeholder={t('superAdminModule.subscriptions.dialog.placeholders.custom')}
          aria-label={`Extra feature ${idx + 1}`}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveExtraFeature(idx)}
          disabled={values.extraFeatures.length === 1}
          className="text-red-500 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      onClick={handleAddExtraFeature}
      className="border-white/20 text-white hover:bg-white/10"
    >
      + {t('superAdminModule.subscriptions.features.addFeature')}
    </Button>
  </>
));
ExtraFeaturesList.displayName = 'ExtraFeaturesList';

// --- Main Dialog Component ---

/**
 * Dialog for adding a new subscription plan.
 */
const AddPlanDialog = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const BILLING_CYCLES = useMemo(() => getBillingCycles(t), [t]);
  const validationSchema = useMemo(() => getValidationSchema(t), [t]);

  // --- Handlers ---
  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    setLoading(true);
    try {
      const res = await dispatch(createSubscriptionPlan(values));
      if (res.meta.requestStatus === 'fulfilled') {
        if (onSuccess) onSuccess();
        resetForm();
        onOpenChange(false);
      } else {
        setErrors({ submit: res.payload || t('superAdminModule.subscriptions.toast.createFailed') });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // These handlers are created inside Formik's render function to access setFieldValue and values
  const renderForm = ({ values, isSubmitting, errors, setFieldValue }) => {
    // Handler for feature switch
    const handleFeatureSwitch = (key, val) => {
      setFieldValue(key, val);
    };
    // Handler for extra feature change
    const handleExtraFeatureChange = (idx, value) => {
      const arr = [...values.extraFeatures];
      arr[idx] = value;
      setFieldValue('extraFeatures', arr);
    };
    // Handler for removing an extra feature
    const handleRemoveExtraFeature = idx => {
      const arr = values.extraFeatures.filter((_, i) => i !== idx);
      setFieldValue('extraFeatures', arr.length ? arr : ['']);
    };
    // Handler for adding an extra feature
    const handleAddExtraFeature = () => {
      setFieldValue('extraFeatures', [...values.extraFeatures, '']);
    };

    return (
      <Form className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-name">{t('superAdminModule.subscriptions.dialog.labels.name')}</label>
          <Field as={Input} id="plan-name" name="name" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.name')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
          <ErrorMessage name="name" component="div" className="text-destructive text-xs mt-1" />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-description">{t('superAdminModule.subscriptions.dialog.labels.description')}</label>
          <Field as={Input} id="plan-description" name="description" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.description')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
          <ErrorMessage name="description" component="div" className="text-destructive text-xs mt-1" />
        </div>
        {/* Price & Billing Cycle */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-price">{t('superAdminModule.subscriptions.dialog.labels.price')}</label>
            <Field as={Input} id="plan-price" name="price" type="number" min="0" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.price')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
            <ErrorMessage name="price" component="div" className="text-destructive text-xs mt-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-billing-cycle">{t('superAdminModule.subscriptions.dialog.labels.billingCycle')}</label>
            <Field name="billingCycle">
              {({ field }) => (
                <Select value={field.value} onValueChange={val => setFieldValue('billingCycle', val)}>
                  <SelectTrigger className="w-full bg-white/5 border-white/20 text-white" id="plan-billing-cycle">
                    <SelectValue placeholder={t('superAdminModule.subscriptions.dialog.placeholders.selectCycle')} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
                    {BILLING_CYCLES.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} >{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            <ErrorMessage name="billingCycle" component="div" className="text-destructive text-xs mt-1" />
          </div>
        </div>
        {/* Branches, Users, Products */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-branches">{t('superAdminModule.subscriptions.dialog.labels.branches')}</label>
            <Field as={Input} id="plan-branches" name="maxBranches" type="number" min="1" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.branches')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
            <ErrorMessage name="maxBranches" component="div" className="text-destructive text-xs mt-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-users">{t('superAdminModule.subscriptions.dialog.labels.users')}</label>
            <Field as={Input} id="plan-users" name="maxUsers" type="number" min="1" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.users')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
            <ErrorMessage name="maxUsers" component="div" className="text-destructive text-xs mt-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plan-products">{t('superAdminModule.subscriptions.dialog.labels.products')}</label>
            <Field as={Input} id="plan-products" name="maxProducts" type="number" min="1" placeholder={t('superAdminModule.subscriptions.dialog.placeholders.products')} className="bg-white/5 border-white/20 text-white placeholder-gray-500" />
            <ErrorMessage name="maxProducts" component="div" className="text-destructive text-xs mt-1" />
          </div>
        </div>
        {/* Features Switches */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('superAdminModule.subscriptions.features.included')}</label>
          <FeaturesSwitchGrid handleFeatureSwitch={handleFeatureSwitch} t={t} />
          {FEATURE_FIELDS.map(f => (
            <ErrorMessage key={f.key} name={f.key} component="div" className="text-destructive text-xs" />
          ))}
        </div>
        {/* Extra Features */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('superAdminModule.subscriptions.features.custom')}</label>
          <ExtraFeaturesList
            values={values}
            handleExtraFeatureChange={handleExtraFeatureChange}
            handleRemoveExtraFeature={handleRemoveExtraFeature}
            handleAddExtraFeature={handleAddExtraFeature}
            t={t}
          />
          <ErrorMessage name="extraFeatures" component="div" className="text-destructive text-xs mt-1" />
        </div>
        {/* Submission error */}
        {errors.submit && <div className="text-destructive text-sm">{errors.submit}</div>}
        {/* Dialog Footer */}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10">{t('superAdminModule.subscriptions.dialog.cancel')}</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting || loading} className="w-28 bg-emerald-600 hover:bg-emerald-500">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('superAdminModule.subscriptions.dialog.save')}
          </Button>
        </DialogFooter>
      </Form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{t('superAdminModule.subscriptions.dialog.addTitle')}</DialogTitle>
          <DialogDescription className="text-gray-400">{t('superAdminModule.subscriptions.dialog.addDesc')}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto pr-4">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {renderForm}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default AddPlanDialog;
