import { Card, CardContent } from '../../../../components/ui/card'
import { useTranslation } from "react-i18next";

const CustomerInformation = ({selectedOrder}) => {
  const { t } = useTranslation();
  return (
       <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-white">{t('dashboard.cashier.invoiceDialog.customerInfo')}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.cashier.customerDialog.table.name')}:</span>
                <span className="text-gray-200">
                  {selectedOrder.customer?.fullName || t('dashboard.cashier.invoiceDialog.walkIn')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.cashier.customerDialog.table.phone')}:</span>
                <span className="text-gray-200">{selectedOrder.customer?.phone || t('dashboard.cashier.invoiceDialog.na')}</span>
              </div>
                 <div className="flex justify-between">
                <span className="text-gray-400">{t('dashboard.cashier.customerDialog.table.email')}:</span>
                <span className="text-gray-200">{selectedOrder.customer?.email || t('dashboard.cashier.invoiceDialog.na')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
  )
}

export default CustomerInformation