import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const InventoryTable = ({ rows, onEdit }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="w-[100px] text-gray-400">SKU</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.inventory.table.product')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.inventory.table.stock')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.inventory.table.category')}</TableHead>
          <TableHead className="text-right text-gray-400">{t('dashboard.branchManager.inventory.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row?.id} className="border-white/10">
              <TableCell className="font-medium text-white">{row.sku}</TableCell>
              <TableCell className="text-gray-300">{row.name.slice(0, 70)}...</TableCell>
              <TableCell className="text-gray-300">{row.quantity}</TableCell>
              <TableCell className="text-gray-300">{row.category}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(row)} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-16 text-gray-400">
              <div className="text-center">
                <h3 className="text-xl font-semibold">{t('dashboard.branchManager.orders.table.noOrders')}</h3>
                <p className="mt-2">{t('dashboard.branchManager.orders.table.noOrdersDesc')}</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InventoryTable;
 