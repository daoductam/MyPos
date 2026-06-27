import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { getAllSubscriptionPlans } from "../../../Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";
import { createPaymentLinkThunk } from "../../../Redux Toolkit/features/payment/paymentThunks";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../components/ui/use-toast";

const Upgrade = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { plans, loading: plansLoading } = useSelector((state) => state.subscriptionPlan);
  const { store } = useSelector((state) => state.store);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllSubscriptionPlans());
  }, [dispatch]);

  const currentPlanId = store?.subscription?.planId;

  // Format currency to VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const handleUpgrade = async (planId) => {
    setSelectedPlanId(planId);
    setPaymentLoading(true);
    try {
      // Default to STRIPE for demo.
      await dispatch(createPaymentLinkThunk({ planId, paymentMethod: "STRIPE" })).unwrap();
      toast({
        title: t('toast.success'),
        description: t('storeModule.upgrade.checkoutOpened') || "Đang mở cổng thanh toán...",
      });
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: error || t('toast.fetchError') || "Không thể tạo liên kết thanh toán.",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('storeModule.upgrade.title')}</h2>
        <p className="text-gray-400">
          {t('storeModule.upgrade.subtitle')}
        </p>
      </div>

      {plansLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col bg-black/20 backdrop-blur-lg border rounded-2xl transition-all duration-300 relative ${
                currentPlanId === plan.id
                  ? "border-emerald-500 shadow-lg shadow-emerald-900/50"
                  : "border-white/10"
              }`}
            >
              {currentPlanId === plan.id && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white">
                  {t('storeModule.upgrade.currentPlan')}
                </Badge>
              )}
              <CardHeader className="border-b border-white/10 text-center pt-8">
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-emerald-400 my-4">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-medium text-gray-400">/{t(`storeModule.upgrade.billingCycle.${plan.billingCycle.toLowerCase()}`)}</span>
                </div>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <ul className="space-y-3">
                  {plan.extraFeatures?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-t border-white/10 p-6">
                <Button
                  className="w-full text-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  disabled={currentPlanId === plan.id || (paymentLoading && selectedPlanId === plan.id)}
                  onClick={() => handleUpgrade(plan.id)}
                  variant={currentPlanId === plan.id ? "outline" : "default"}
                >
                  {paymentLoading && selectedPlanId === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('storeModule.upgrade.processing') || "Đang xử lý..."}
                    </span>
                  ) : currentPlanId === plan.id ? (
                    t('storeModule.upgrade.currentlyActive')
                  ) : (
                    t('storeModule.upgrade.choosePlan')
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upgrade;
