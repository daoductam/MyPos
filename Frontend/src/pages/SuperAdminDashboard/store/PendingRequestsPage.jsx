import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; 
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { getAllStores, moderateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { formatDateTime } from "@/utils/formateDate";
import { useTranslation } from "react-i18next";

export default function PendingRequestsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stores, loading, error } = useSelector((state) => state.store);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getAllStores("PENDING"));
  }, [dispatch]);

  const handleApprove = (store) => {
    setSelectedRequest(store);
    setApprovalDialogOpen(true);
  };

  const handleReject = (store) => {
    setSelectedRequest(store);
    setRejectionDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (selectedRequest) {
      setUpdatingId(selectedRequest.id);
      try {
        await dispatch(moderateStore({ storeId: selectedRequest.id, action: "ACTIVE" })).unwrap();
        toast({
          title: t('superAdminModule.stores.pendingRequests.toast.approved'),
          description: t('superAdminModule.stores.pendingRequests.toast.approvedDesc', { name: selectedRequest.brand }),
        });
      } catch (e) {
        toast({
          title: t('superAdminModule.stores.pendingRequests.toast.approveFailed'),
          description: e?.message || t('superAdminModule.stores.pendingRequests.toast.approveFailed'),
          variant: "destructive",
        });
      } finally {
        setApprovalDialogOpen(false);
        setSelectedRequest(null);
        setUpdatingId(null);
      }
    }
  };

  const confirmReject = async () => {
    if (selectedRequest && rejectionReason.trim()) {
      setUpdatingId(selectedRequest.id);
      try {
        await dispatch(moderateStore({ storeId: selectedRequest.id, action: "BLOCKED" })).unwrap();
        toast({
          title: t('superAdminModule.stores.pendingRequests.toast.rejected'),
          description: t('superAdminModule.stores.pendingRequests.toast.rejectedDesc', { name: selectedRequest.brand }),
        });
      } catch (e) {
        toast({
          title: t('superAdminModule.stores.pendingRequests.toast.rejectFailed'),
          description: e?.message || t('superAdminModule.stores.pendingRequests.toast.rejectFailed'),
          variant: "destructive",
        });
      } finally {
        setRejectionDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason("");
        setUpdatingId(null);
      }
    }
  };



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('superAdminModule.stores.pendingRequests.title')}</h2>
          <p className="text-gray-400">
            {t('superAdminModule.stores.pendingRequests.subtitle')}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/10 text-yellow-300 border-yellow-500/20">
          <Clock className="w-3 h-3" />
          {t('superAdminModule.stores.pendingRequests.count', { count: stores.length })}
        </Badge>
      </div>

      <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        {loading && stores.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-destructive">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : stores.length > 0 ? (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                    <TableHead>{t('superAdminModule.stores.pendingRequests.table.name')}</TableHead>
                    <TableHead>{t('superAdminModule.stores.pendingRequests.table.owner')}</TableHead>
                    <TableHead>{t('superAdminModule.stores.pendingRequests.table.contact')}</TableHead>
                    <TableHead>{t('superAdminModule.stores.pendingRequests.table.type')}</TableHead>
                    <TableHead>{t('superAdminModule.stores.pendingRequests.table.submitted')}</TableHead>
                   
                    <TableHead className="text-right">{t('superAdminModule.stores.pendingRequests.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.filter(s => s.status === 'PENDING').map((store) => (
                    <TableRow key={store.id} className="hover:bg-white/5 border-b-white/10">
                      <TableCell className="font-medium text-white">{store.brand}</TableCell>
                      <TableCell className="text-gray-400">{store.storeAdmin?.fullName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-300">{store.storeAdmin?.mobile || store.contact?.phone || "-"}</div>
                          <div className="text-gray-400">{store.storeAdmin?.email || store.contact?.email || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{store.storeType || "-"}</TableCell>
                      <TableCell>{formatDateTime(store.createdAt)}</TableCell>
                 
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(store)}
                            className="border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                            disabled={updatingId === store.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {updatingId === store.id ? t('superAdminModule.stores.pendingRequests.table.approving') : t('superAdminModule.stores.pendingRequests.table.approve')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(store)}
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            disabled={updatingId === store.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {updatingId === store.id ? t('superAdminModule.stores.pendingRequests.table.rejecting') : t('superAdminModule.stores.pendingRequests.table.reject')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>{t('superAdminModule.stores.pendingRequests.noRequests')}</p>
          </div>
        )}
      </div>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>{t('superAdminModule.stores.pendingRequests.dialog.approveTitle')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('superAdminModule.stores.pendingRequests.dialog.approveDesc', { name: selectedRequest?.brand })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setApprovalDialogOpen(false)}>
              {t('superAdminModule.stores.pendingRequests.dialog.cancel')}
            </Button>
            <Button onClick={confirmApprove} className="bg-emerald-600 hover:bg-emerald-500">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('superAdminModule.stores.pendingRequests.dialog.confirmApprove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>{t('superAdminModule.stores.pendingRequests.dialog.rejectTitle')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('superAdminModule.stores.pendingRequests.dialog.rejectDesc', { name: selectedRequest?.brand })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('superAdminModule.stores.pendingRequests.dialog.rejectPlaceholder')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="bg-white/5 border-white/20 text-white placeholder-gray-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setRejectionDialogOpen(false)}>
              {t('superAdminModule.stores.pendingRequests.dialog.cancel')}
            </Button>
            <Button
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t('superAdminModule.stores.pendingRequests.dialog.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 