import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const LowStockProductTable = ({ products }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle />
          {t('storeModule.alerts.lowStock.title')}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {t('storeModule.alerts.lowStock.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                <TableHead className="text-white">{t('storeModule.alerts.lowStock.productName')}</TableHead>
                <TableHead className="text-white">{t('storeModule.alerts.lowStock.sku')}</TableHead>
                <TableHead className="text-right text-white">{t('storeModule.alerts.lowStock.stockRemaining')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <TableRow key={product.id || index} className="hover:bg-white/5 border-b-white/10">
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell className="text-gray-400">{product.sku}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20">
                        {/* Assuming stock quantity is not directly in ProductDTO if fetched from certain endpoints, 
                            but findLowStockProducts returns ProductDTO list. 
                            Low stock threshold items might need inventory check. */}
                        {product.quantity !== undefined ? product.quantity : "—"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockProductTable;
