import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const EmployeeForm = ({ initialData, onSubmit, roles }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    fullName: Yup.string().required(t('storeModule.employees.validation.nameRequired')),
    email: Yup.string()
      .email(t('storeModule.employees.validation.emailInvalid'))
      .required(t('storeModule.employees.validation.emailRequired')),
    phone: Yup.string().required(t('storeModule.employees.validation.phoneRequired')),
    role: Yup.string().required(t('storeModule.employees.validation.roleRequired')),
    branchId: Yup.string().when("role", {
      is: (role) => role === "ROLE_BRANCH_MANAGER" || role === "ROLE_BRANCH_CASHIER" || role === "ROLE_BRANCH_ADMIN",
      then: (schema) => schema.required(t('storeModule.employees.validation.branchRequired')),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string()
      .min(8, t('storeModule.employees.validation.passwordMin'))
      .required(t('storeModule.employees.validation.passwordRequired')),
  });

  const dispatch = useDispatch();
  const { branches } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);

  useEffect(() => {
    dispatch(
      getAllBranchesByStore({
        storeId: store?.id,
        jwt: localStorage.getItem("jwt"),
      })
    );
  }, [dispatch, store?.id]);





  const formik = useFormik({
    initialValues: initialData || {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "",
      branchId: initialData ? String(initialData.branchId) : "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues(initialData);
    } else {
      formik.resetForm();
    }
  }, [initialData]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 py-2 pr-2">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-300">{t('storeModule.employees.form.fullName')}</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${formik.touched.fullName && formik.errors.fullName ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
          placeholder={t('storeModule.employees.form.fullNamePlaceholder')}
        />
        {formik.touched.fullName && formik.errors.fullName ? (
          <div className="text-red-400 text-sm">{formik.errors.fullName}</div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">{t('storeModule.employees.form.email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
          placeholder={t('storeModule.employees.form.emailPlaceholder')}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="text-red-400 text-sm">{formik.errors.email}</div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">{t('storeModule.employees.form.password')}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${formik.touched.password && formik.errors.password ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
          placeholder={t('storeModule.employees.form.passwordPlaceholder')}
        />
        {formik.touched.password && formik.errors.password ? (
          <div className="text-red-400 text-sm">{formik.errors.password}</div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">{t('storeModule.employees.form.phone')}</Label>
        <Input
          id="phone"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${formik.touched.phone && formik.errors.phone ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
          placeholder={t('storeModule.employees.form.phonePlaceholder')}
        />
        {formik.touched.phone && formik.errors.phone ? (
          <div className="text-red-400 text-sm">{formik.errors.phone}</div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-300">{t('storeModule.employees.form.role')}</Label>
          <Select
            value={formik.values.role}
            onValueChange={(value) => {
            formik.setFieldValue("role", value);
            if (value !== "ROLE_BRANCH_MANAGER" && value !== "ROLE_BRANCH_CASHIER" && value !== "ROLE_BRANCH_ADMIN") {
              formik.setFieldValue("branchId", "");
            }
          }}
            onOpenChange={() => formik.setFieldTouched("role", true)}
          >
            <SelectTrigger className={`w-full text-left border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40 ${formik.touched.role && formik.errors.role ? "border-red-500" : "border-white/20"}`}>
              <SelectValue placeholder={t('storeModule.employees.form.rolePlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/80 border-white/20 text-white backdrop-blur-lg">
              {roles?.map((role) => (
                <SelectItem key={role} value={role} className="focus:bg-emerald-700/50">
                  {t(`common.roles.${role}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.role && formik.errors.role ? (
            <div className="text-red-400 text-sm">{formik.errors.role}</div>
          ) : null}
        </div>
        {(formik.values.role === "ROLE_BRANCH_MANAGER" || formik.values.role === "ROLE_BRANCH_ADMIN" || formik.values.role === "ROLE_BRANCH_CASHIER") && (
          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-gray-300">{t('storeModule.employees.form.branch')}</Label>
            <Select
              value={formik.values.branchId}
              onValueChange={(value) => formik.setFieldValue("branchId", value)}
              onOpenChange={() => formik.setFieldTouched("branchId", true)}
            >
              <SelectTrigger className={`w-full text-left border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40 ${formik.touched.branchId && formik.errors.branchId ? "border-red-500" : "border-white/20"}`}>
                <SelectValue placeholder={t('storeModule.employees.form.branchPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/80 border-white/20 text-white backdrop-blur-lg">
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)} className="focus:bg-emerald-700/50">
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.branchId && formik.errors.branchId ? (
              <div className="text-red-400 text-sm">{formik.errors.branchId}</div>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
          {initialData ? t('storeModule.employees.form.saveChanges') : t('storeModule.employees.addEmployee')}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
