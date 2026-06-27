import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import StoreTable from "./StoreTable";
import StoreDetailDrawer from "./StoreDetailDrawer";
import { getAllStores } from "../../../Redux Toolkit/features/store/storeThunks";
import { useTranslation } from "react-i18next";

export default function StoreListPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stores, loading, error } = useSelector((state) => state.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fix: Send an empty string for "ALL" to fetch all stores, as the backend expects an enum or nothing.
    dispatch(getAllStores(statusFilter === "ALL" ? "" : statusFilter));
  }, [dispatch, statusFilter]);

  const filteredStores = useMemo(() => {
    return stores.filter(store =>
      (store.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (store.id?.toString() || '').includes(searchTerm)
    );
  }, [stores, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setIsDrawerOpen(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('superAdminModule.stores.title')}</h2>
          <p className="text-gray-400">
            {t('superAdminModule.stores.subtitle')}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t('superAdminModule.stores.searchPlaceholder')}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder={t('superAdminModule.stores.filterPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
                  <SelectItem value="ALL">{t('superAdminModule.stores.allStatuses')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('superAdminModule.stores.statuses.active')}</SelectItem>
                  <SelectItem value="PENDING">{t('superAdminModule.stores.statuses.pending')}</SelectItem>
                  <SelectItem value="BLOCKED">{t('superAdminModule.stores.statuses.blocked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && stores.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <StoreTable stores={paginatedStores} onSelectStore={handleSelectStore} />
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline" className="border-white/20 text-white hover:bg-white/10"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t('superAdminModule.stores.pagination.previous')}
                  </Button>
                  <span className="text-sm text-gray-400">
                    {t('superAdminModule.stores.pagination.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  <Button
                    variant="outline" className="border-white/20 text-white hover:bg-white/10"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t('superAdminModule.stores.pagination.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <StoreDetailDrawer
        store={selectedStore}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}