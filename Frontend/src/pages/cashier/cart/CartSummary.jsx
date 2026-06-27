import React from "react";
import { Separator } from "../../../components/ui/separator";
import { useSelector } from "react-redux";
import {
  selectDiscountAmount,
  selectSubtotal,
  selectTax,
  selectTotal,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { formatVND } from "@/utils/formatCurrency";


const CartSummary = () => {
  const { t } = useTranslation();
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const discountAmount = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);

  return (
    <div className="border-t border-white/10 bg-black/20 p-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">{t('dashboard.cashier.cart.summary.subtotal')}:</span>
          <span className="text-gray-200">VNĐ {formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('dashboard.cashier.cart.summary.tax')}:</span>
          <span className="text-gray-200">VNĐ {formatVND(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('dashboard.cashier.cart.summary.discount')}:</span>
          <span className="text-red-400">- VNĐ {formatVND(discountAmount)}</span>
        </div>
        <Separator className="bg-white/10" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-white">{t('dashboard.cashier.cart.summary.total')}:</span>
          <span className="text-emerald-400">VNĐ {formatVND(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
