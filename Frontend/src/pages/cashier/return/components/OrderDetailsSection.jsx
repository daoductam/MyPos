import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '../../order/data';
import { useTranslation } from "react-i18next";

const OrderDetailsSection = ({ selectedOrder, setSelectedOrder }) => {
  const { t } = useTranslation();
  return (
    <div className="w-1/2 border-r p-4 flex flex-col">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
          ← {t('dashboard.cashier.return.backToSearch')}
        </Button>
      </div>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-semibold text-lg">{t('dashboard.cashier.return.orderNumber', { id: selectedOrder.id })}</h2>
              <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <Badge variant="outline">
              {t(`dashboard.cashier.paymentDialog.methods.${selectedOrder.paymentType}`)}
            </Badge>
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{t('dashboard.cashier.customerDialog.table.name')}</h3>
            <p>{selectedOrder?.customer?.fullName || t('dashboard.cashier.paymentDialog.walkInCustomer')}</p>
            <p className="text-sm">{selectedOrder.customer?.phone}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{t('dashboard.cashier.return.orderSummary')}</h3>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>{t('dashboard.cashier.cart.totalItems')}:</span>
                <span>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{t('dashboard.cashier.cart.total')}:</span>
                <span>VNĐ {selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex-1 overflow-auto">
        <h3 className="font-semibold mb-2">{t('dashboard.cashier.return.orderItems')}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('dashboard.cashier.return.item')}</TableHead>
              <TableHead className="text-center">{t('dashboard.cashier.return.qty')}</TableHead>
              <TableHead className="text-right">{t('dashboard.cashier.return.price')}</TableHead>
              <TableHead className="text-right">{t('dashboard.cashier.return.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedOrder.items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">VNĐ {(item.product?.sellingPrice)?.toFixed(2)}</TableCell>
                <TableCell className="text-right">VNĐ {(item.product?.sellingPrice * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderDetailsSection;