import React from "react";
import { Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import StoreStatusBadge from "./StoreStatusBadge";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export default function StoreTable({ stores, onSelectStore }) {
    const { t } = useTranslation();
    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                        <TableHead>{t('superAdminModule.stores.table.id')}</TableHead>
                        <TableHead>{t('superAdminModule.stores.table.name')}</TableHead>
                        <TableHead>{t('superAdminModule.stores.table.owner')}</TableHead>
                        <TableHead>{t('superAdminModule.stores.table.regDate')}</TableHead>
                        <TableHead>{t('superAdminModule.stores.table.status')}</TableHead>
                        <TableHead className="text-right pr-6">{t('superAdminModule.stores.table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stores.map((store) => (
                        <TableRow key={store.id} className="hover:bg-white/5 border-b-white/10">
                            <TableCell className="font-mono text-sm text-gray-500">{store.id}</TableCell>
                            <TableCell className="font-medium text-white">{store.brand}</TableCell>
                            <TableCell className="text-gray-400">{store.storeAdmin?.fullName}</TableCell>
                            <TableCell className="text-gray-400">
                                {new Date(store.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <StoreStatusBadge status={store.status} />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <Button
                                    variant="outline" className="border-white/20 text-white hover:bg-white/10"
                                    size="sm"
                                    onClick={() => onSelectStore(store)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    {t('superAdminModule.stores.table.viewDetails')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
