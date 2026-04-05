import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useTranslation } from "react-i18next";
import { formatVND } from "@/utils/formatCurrency";


const OrderItemTable = ({ selectedOrder }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t('dashboard.cashier.invoiceDialog.itemsTable.image')}</TableHead>
          <TableHead>{t('dashboard.cashier.invoiceDialog.itemsTable.item')}</TableHead>
          <TableHead className="text-center">{t('dashboard.cashier.invoiceDialog.itemsTable.quantity')}</TableHead>
          <TableHead className="text-right">{t('dashboard.cashier.invoiceDialog.itemsTable.price')}</TableHead>
          <TableHead className="text-right">{t('dashboard.cashier.invoiceDialog.itemsTable.total')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {selectedOrder.items?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="">
              <div className=" w-10 h-10">
                {item.product?.image ? (
                  <img
                    src={item.product.image}
                    alt={item.productName || item.product?.name || "Product"}
                    className="w-10 h-10 object-cover rounded-md "
                  />
                ) : null}
                {(!item.product?.image || item.product?.image === "") && (
                  <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-medium">
                      {item.productName
                        ? item.productName.charAt(0).toUpperCase()
                        : item.product?.name
                        ? item.product.name.charAt(0).toUpperCase()
                        : "P"}
                    </span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">
                  {item.product?.name.slice(0, 20) || "Product"}...
                </span>
                {item.product?.sku && (
                  <span className="text-xs text-gray-500">
                    SKU: {item.product.sku.slice(0, 17)+"."}...
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-right">
              VNĐ {formatVND(item.product?.sellingPrice)}
            </TableCell>
            <TableCell className="text-right font-medium">
              VNĐ {formatVND(item.product?.sellingPrice * item.quantity)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderItemTable;
