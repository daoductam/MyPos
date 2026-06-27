import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBranch, updateBranch } from "@/Redux Toolkit/features/branch/branchThunks";
import { useTranslation } from "react-i18next";

const BranchForm = ({ initialValues, onSubmit, onCancel, isEditing }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);

  const validationSchema = Yup.object({
    name: Yup.string().required(t('storeModule.branches.validation.nameRequired')),
    address: Yup.string().required(t('storeModule.branches.validation.addressRequired')),
    manager: Yup.string().required(t('storeModule.branches.validation.managerRequired')),
    phone: Yup.string().required(t('storeModule.branches.validation.phoneRequired')),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!store?.id) {
        toast({
          title: t('toast.error'),
          description: t('storeModule.branches.toast.storeMissing'),
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const branchData = {
        ...values,
        storeId: store.id,
      };

      if (isEditing) {
        await dispatch(updateBranch({ id: initialValues.id, dto: branchData, jwt })).unwrap();
        toast({ title: t('toast.success'), description: t('storeModule.branches.toast.updateSuccess') });
      } else {
        await dispatch(createBranch({ dto: branchData, jwt })).unwrap();
        toast({ title: t('toast.success'), description: t('storeModule.branches.toast.createSuccess') });
      }
      onSubmit();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.fetchError'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues || { name: "", address: "", manager: "", phone: "" }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6 py-2 pr-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('storeModule.branches.form.name')}</label>
            <Field
              as={Input}
              id="name"
              name="name"
              placeholder={t('storeModule.branches.form.namePlaceholder')}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            />
            <ErrorMessage name="name" component="div" className="text-red-400 text-sm" />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-300">{t('storeModule.branches.form.address')}</label>
            <Field
              as={Input}
              id="address"
              name="address"
              placeholder={t('storeModule.branches.form.addressPlaceholder')}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            />
            <ErrorMessage name="address" component="div" className="text-red-400 text-sm" />
          </div>

          <div className="space-y-2">
            <label htmlFor="manager" className="block text-sm font-medium text-gray-300">{t('storeModule.branches.form.manager')}</label>
            <Field
              as={Input}
              id="manager"
              name="manager"
              placeholder={t('storeModule.branches.form.managerPlaceholder')}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            />
            <ErrorMessage name="manager" component="div" className="text-red-400 text-sm" />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">{t('storeModule.branches.form.phone')}</label>
            <Field
              as={Input}
              id="phone"
              name="phone"
              placeholder={t('storeModule.branches.form.phonePlaceholder')}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            />
            <ErrorMessage name="phone" component="div" className="text-red-400 text-sm" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
              {t('storeModule.branches.form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || loading} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {isSubmitting || loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? t('storeModule.branches.form.updating') : t('storeModule.branches.form.adding')}
                </span>
              ) : (
                isEditing ? t('storeModule.branches.form.updateBranch') : t('storeModule.branches.addBranch')
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default BranchForm;