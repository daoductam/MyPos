import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { DollarSign, Edit, TrendingUp } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";

export default function CommissionsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await api.get("/api/v1/stores/commission-summary");
        setCommissions((response.data || []).map((store) => ({
          id: store.storeId,
          storeName: store.storeName,
          status: store.status,
          currentRate: Number(store.commissionRate || 0),
          grossSales: Number(store.grossSales || 0),
          totalEarnings: Number(store.commissionEarnings || 0),
          completedOrders: Number(store.completedOrders || 0),
        })));
      } catch (error) {
        toast({
          title: t("superAdminModule.commissions.title"),
          description: error?.customMessage || t("superAdminModule.commissions.loadFailed", "Could not load commission settings."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [t, toast]);

  const handleEditCommission = (commission) => {
    setSelectedCommission(commission);
    setNewRate(commission.currentRate.toString());
    setEditDialogOpen(true);
  };

  const confirmEditCommission = async () => {
    if (!selectedCommission || !newRate) return;
    const rate = Number(newRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      toast({ title: t("superAdminModule.commissions.toast.invalidRate"), description: t("superAdminModule.commissions.toast.invalidRateDesc"), variant: "destructive" });
      return;
    }
    try {
      const response = await api.patch(`/api/v1/stores/${selectedCommission.id}/commission-rate`, { rate });
      const updated = response.data;
      setCommissions((previous) => previous.map((item) => item.id === selectedCommission.id
        ? { ...item, currentRate: Number(updated.commissionRate ?? rate), lastUpdated: updated.updatedAt }
        : item));
      toast({ title: t("superAdminModule.commissions.toast.updated"), description: t("superAdminModule.commissions.toast.updatedDesc", { name: selectedCommission.storeName, rate }) });
      setEditDialogOpen(false);
      setSelectedCommission(null);
      setNewRate("");
    } catch (error) {
      toast({ title: t("superAdminModule.commissions.title"), description: error?.customMessage || t("superAdminModule.commissions.updateFailed", "Could not update the commission rate."), variant: "destructive" });
    }
  };

  const averageRate = commissions.length ? commissions.reduce((sum, item) => sum + item.currentRate, 0) / commissions.length : null;
  const totalEarnings = commissions.reduce((sum, item) => sum + item.totalEarnings, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t("superAdminModule.commissions.title")}</h2>
        <p className="text-gray-400">{t("superAdminModule.commissions.subtitle")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-black/20 border border-white/10 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-400">{t("superAdminModule.commissions.stats.totalEarnings")}</CardTitle><DollarSign className="h-4 w-4 text-gray-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalEarnings.toLocaleString()}</div><p className="text-xs text-gray-400">{t("superAdminModule.commissions.stats.earningsHint", "Based on completed orders.")}</p></CardContent></Card>
        <Card className="bg-black/20 border border-white/10 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-400">{t("superAdminModule.commissions.stats.averageRate")}</CardTitle><TrendingUp className="h-4 w-4 text-gray-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{averageRate == null ? "—" : `${averageRate.toFixed(2)}%`}</div><p className="text-xs text-gray-400">{t("superAdminModule.commissions.stats.currentAverage", "Current average rate")}</p></CardContent></Card>
        <Card className="bg-black/20 border border-white/10 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-400">{t("superAdminModule.commissions.stats.activeStores")}</CardTitle><DollarSign className="h-4 w-4 text-gray-400" /></CardHeader><CardContent><div className="text-2xl font-bold">{commissions.filter((item) => item.status === "ACTIVE").length}</div><p className="text-xs text-gray-400">{t("superAdminModule.commissions.stats.rateSetHint")}</p></CardContent></Card>
      </div>
      <Card className="bg-black/20 border border-white/10 text-white"><CardHeader className="border-b border-white/10"><CardTitle>{t("superAdminModule.commissions.table.title")}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t("superAdminModule.commissions.table.storeName")}</TableHead><TableHead>{t("superAdminModule.commissions.table.currentRate")}</TableHead><TableHead>{t("superAdminModule.commissions.table.totalEarnings")}</TableHead><TableHead>{t("superAdminModule.commissions.table.completedOrders", "Completed Orders")}</TableHead><TableHead className="text-right">{t("superAdminModule.commissions.table.actions")}</TableHead></TableRow></TableHeader><TableBody>
        {loading && <TableRow><TableCell colSpan={5} className="text-center text-gray-400">Loading...</TableCell></TableRow>}
        {!loading && commissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-400">No stores found.</TableCell></TableRow>}
        {!loading && commissions.map((commission) => <TableRow key={commission.id}><TableCell className="font-medium">{commission.storeName}</TableCell><TableCell><Badge variant="outline">{commission.currentRate}%</Badge></TableCell><TableCell>{commission.totalEarnings.toLocaleString()}</TableCell><TableCell>{commission.completedOrders}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditCommission(commission)}><Edit className="w-4 h-4 mr-1" />{t("superAdminModule.commissions.table.editRate")}</Button></TableCell></TableRow>)}
      </TableBody></Table></CardContent></Card>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}><DialogContent className="bg-gray-800 border-white/10 text-white"><DialogHeader><DialogTitle>{t("superAdminModule.commissions.dialog.editTitle")}</DialogTitle><DialogDescription className="text-gray-400">{t("superAdminModule.commissions.dialog.editDesc", { name: selectedCommission?.storeName })}</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="new-rate">{t("superAdminModule.commissions.dialog.newRateLabel")}</Label><Input id="new-rate" type="number" min="0" max="100" step="0.1" value={newRate} onChange={(event) => setNewRate(event.target.value)} /></div><DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t("superAdminModule.commissions.dialog.cancel")}</Button><Button onClick={confirmEditCommission} className="bg-emerald-600"><Edit className="w-4 h-4 mr-2" />{t("superAdminModule.commissions.dialog.update")}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
