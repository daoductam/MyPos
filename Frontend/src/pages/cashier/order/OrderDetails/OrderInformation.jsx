import { formatDate, getPaymentModeLabel, getStatusBadgeVariant } from '../data'
import { Badge } from '../../../../components/ui/badge'
import { Card, CardContent } from '../../../../components/ui/card'
import { useTranslation } from "react-i18next";

const OrderInformation = ({selectedOrder}) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-white">{t('dashboard.cashier.invoiceDialog.orderInfo')}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.branchManager.orders.table.date')}:</span>
                <span className="text-gray-200">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.cashier.invoiceDialog.paymentMethod')}:</span>
                <span className="text-gray-200">{t(`dashboard.cashier.paymentDialog.methods.${selectedOrder.paymentType}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.cashier.paymentSection.totalAmount')}:</span>
                <span className="font-semibold text-emerald-400">
                  VNĐ {selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
  )
}

export default OrderInformation