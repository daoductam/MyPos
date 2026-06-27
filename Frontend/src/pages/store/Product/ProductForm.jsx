import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  updateProduct,
} from "@/Redux Toolkit/features/product/productThunks";
import { useToast } from "@/components/ui/use-toast";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { PhoneOutgoing } from "lucide-react";
import { X } from "lucide-react";
import { useState } from "react";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { useTranslation } from "react-i18next";

const ProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { loading } = useSelector((state) => state.product);
  const { store } = useSelector((state) => state.store);
  const { categories: categoryList } = useSelector((state) => state.category);
  const [uploadImage, setUploadingImage] = useState(false);
  const { t } = useTranslation();

  // Validate form using i18n inside component or just inline since validation outside doesn't have hooks easily without recreating.
  // We recreate validationSchema inside to use t()
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('toast.error') + ": " + t('storeModule.products.form.productName')),
    sku: Yup.string().required(t('toast.error') + ": " + t('storeModule.products.form.sku')),
    mrp: Yup.number()
      .required(t('toast.error') + ": " + t('storeModule.products.form.mrp'))
      .positive(),
    sellingPrice: Yup.number()
      .required(t('toast.error') + ": " + t('storeModule.products.form.sellingPrice'))
      .positive(),
    categoryId: Yup.string().required(t('toast.error') + ": " + t('storeModule.products.form.category')),
    description: Yup.string().optional(),
    brand: Yup.string().optional(),
    color: Yup.string().optional(),
    image: Yup.string().optional(),
  });

  const defaultValues = {
    name: "",
    sku: "",
    description: "",
    mrp: "",
    sellingPrice: "",
    brand: "",
    categoryId: "",
    color: "",
    image: null,
    ...initialValues,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log("Submit triggered with values:", values);
    try {
      if (!store?.id) {
        throw new Error(t('toast.fetchError') + ": Store ID is missing");
      }
      const token = localStorage.getItem("jwt");
      const dto = {
        ...values,
        mrp: parseFloat(values.mrp) || 0,
        sellingPrice: parseFloat(values.sellingPrice) || 0,
        storeId: store.id,
        categoryId: parseInt(values.categoryId),
      };
      
      console.log("Submitting product DTO:", dto);

      if (isEditing && initialValues?.id) {
        await dispatch(
          updateProduct({ id: initialValues.id, dto, token })
        ).unwrap();
        toast({
          title: t('toast.success'),
          description: t('toast.productUpdated'),
        });
      } else {
        await dispatch(createProduct(dto)).unwrap();
        toast({ title: t('toast.success'), description: t('toast.productAdded') });
        resetForm();
      }

      if (onSubmit) onSubmit();
    } catch (err) {
      toast({
        title: t('toast.error'),
        description: err || t('toast.fetchError'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (store?.id && token) {
      dispatch(getCategoriesByStore({ storeId: store.id, token }));
    }
  }, [dispatch, store]);

  const handleImageChange = async (e, setFieldValue) => {
    const file = e.target.files[0];
    setUploadingImage(true);
    const image = await uploadToCloudinary(file);
    setFieldValue("image",image);
    setUploadingImage(false)
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, touched, errors, values, setFieldValue }) => {
        // Debugging: Log validation errors if submission is attempted and fails
        React.useEffect(() => {
          if (Object.keys(errors).length > 0 && isSubmitting) {
            console.error("Form validation failed:", errors);
          }
        }, [errors, isSubmitting]);

        return (
          <Form className="space-y-4 py-2 pr-2">
          <div className="flex flex-wrap gap-5" item xs={12}>
            {!values.image ? (
              <>
                {" "}
                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
                <label className="relative" htmlFor="fileInput">
                  <span className="w-24 h-24 cursor-pointer flex items-center justify-center p-3 border-2 border-dashed rounded-lg border-white/20 hover:border-white/40 hover:bg-white/10 transition-all">
                    <PhoneOutgoing className="text-gray-400" />
                  </span>
                  {uploadImage && (
                    <div className="absolute inset-0 w-24 h-24 flex justify-center items-center bg-black/50 rounded-lg">
                      <p className="text-white">{t('storeModule.products.form.uploading')}</p>
                    </div>
                  )}
                </label>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <img
                    className="w-24 h-24 object-cover rounded-lg border border-white/20"
                    src={values.image}
                    alt={`ProductImage`}
                  />
                  <Button
                    onClick={() => {
                      setFieldValue("image", null)
                      // console.log("handle remove image")
                    }}
                    className="absolute top-0 right-0"
                    size="icon"
                    variant="ghost"
                  >
                    <X />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-300">
              {t('storeModule.products.form.image')}
            </label>
            <Field
              as={Input}
              id="image"
              name="image"
              className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40`}
              placeholder={t('storeModule.products.form.pasteUrl')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              {t('storeModule.products.form.productName')}
            </label>
            <Field
              as={Input}
              id="name"
              name="name"
              placeholder={t('storeModule.products.form.enterName')}
              className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${touched.name && errors.name ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
            />
            <ErrorMessage
              name="name"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-300">
              {t('storeModule.products.form.sku')}
            </label>
            <Field
              as={Input}
              id="sku"
              name="sku"
              placeholder={t('storeModule.products.form.enterSku')}
              className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${touched.sku && errors.sku ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
            />
            <ErrorMessage
              name="sku"
              component="div"
              className="text-red-400 text-sm"
            />
          </div>

          <div className="space-y-2"> 
            <label htmlFor="brand" className="block text-sm font-medium text-gray-300">
              {t('storeModule.products.form.brand')}
            </label>
            <Field
              as={Input}
              id="brand"
              name="brand"
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
              placeholder={t('storeModule.products.form.enterBrand')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">
                {t('storeModule.products.form.category')}
              </label>
              <Field name="categoryId">
                {({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      setFieldValue("categoryId", value)
                    }
                  >
                    <SelectTrigger
                      className={`w-full text-left border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40 ${touched.categoryId && errors.categoryId ? "border-red-500" : "border-white/20"}`}
                    >
                      <SelectValue placeholder={t('storeModule.products.form.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800/80 border-white/20 text-white backdrop-blur-lg">
                      {categoryList.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                          className="focus:bg-emerald-700/50"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage
                name="categoryId"
                component="div"
                className="text-red-400 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="color" className="block text-sm font-medium text-gray-300">
                {t('storeModule.products.form.color')}
              </label>
              <Field
                as={Input}
                id="color"
                name="color"
                className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                placeholder={t('storeModule.products.form.enterColor')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="mrp" className="block text-sm font-medium text-gray-300">
                {t('storeModule.products.form.mrp')}
              </label>
              <Field
                as={Input}
                id="mrp"
                name="mrp"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${touched.mrp && errors.mrp ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
              />
              <ErrorMessage
                name="mrp"
                component="div"
                className="text-red-400 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-gray-300"
              >
                {t('storeModule.products.form.sellingPrice')}
              </label>
              <Field
                as={Input}
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 ${touched.sellingPrice && errors.sellingPrice ? "border-red-500" : "border-white/20 hover:border-white/40"}`}
              />
              <ErrorMessage
                name="sellingPrice"
                component="div"
                className="text-red-400 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              {t('storeModule.products.form.description')}
            </label>
            <Field
              as={Textarea}
              id="description"
              name="description"
              placeholder={t('storeModule.products.form.enterDescription')}
              className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                {t('storeModule.products.form.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditing ? t('storeModule.products.form.updating') : t('storeModule.products.form.adding')}
                </span>
              ) : isEditing ? (
                t('storeModule.products.form.updateBtn')
              ) : (
                t('storeModule.products.form.addBtn')
              )}
            </Button>
          </div>
        </Form>
      );
    }}
    </Formik>
  );
};

export default ProductForm;
