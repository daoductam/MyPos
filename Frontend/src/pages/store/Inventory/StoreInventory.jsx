import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInventoryByBranch,
  createInventory,
  updateInventory,
} from "@/Redux Toolkit/features/inventory/inventoryThunks";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import InventoryTable from "@/pages/Branch Manager/Inventory/InventoryTable";
import InventoryFilters from "@/pages/Branch Manager/Inventory/InventoryFilters";
import InventoryFormDialog from "@/pages/Branch Manager/Inventory/InventoryFormDialog";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";

const StoreInventory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { store } = useSelector((state) => state.store);
  const { branches } = useSelector((state) => state.branch);
  const inventories = useSelector((state) => state.inventory.inventories);
  const products = useSelector((state) => state.product.products);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editProductId, setEditProductId] = useState("");

  // Load all branches and products of the store
  useEffect(() => {
    if (store?.id) {
      const jwt = localStorage.getItem("jwt");
      dispatch(getAllBranchesByStore({ storeId: store.id, jwt }));
      dispatch(getProductsByStore(store.id));
    }
  }, [store?.id, dispatch]);

  // Set default selected branch when branches load
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id.toString());
    }
  }, [branches, selectedBranchId]);

  // Fetch inventory whenever selected branch changes
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(getInventoryByBranch(Number(selectedBranchId)));
    }
  }, [selectedBranchId, dispatch]);

  // Map inventory to table rows with product info
  const inventoryRows = (inventories || []).map((inv) => {
    const product = products.find((p) => p?.id === inv.productId) || {};
    return {
      id: inv?.id,
      sku: product.sku || inv.productId,
      name: product.name || t('auth.noData'),
      quantity: inv.quantity,
      category: product.category || "",
      productId: inv.productId,
    };
  });

  // Filter inventory based on search and filters
  const filteredRows = inventoryRows.filter((row) => {
    const matchesSearch =
      row?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "all" || !category || row.category === category;
    return matchesSearch && matchesCategory;
  });

  // Add Inventory
  const handleAddInventory = async () => {
    if (!selectedProductId || !quantity || !selectedBranchId) return;
    try {
      await dispatch(
        createInventory({
          branchId: Number(selectedBranchId),
          productId: selectedProductId,
          quantity: Number(quantity),
        })
      ).unwrap();
      toast({ title: t('toast.success'), description: t('dashboard.branchManager.inventory.toast.added') || "Đã thêm tồn kho" });
      setIsAddDialogOpen(false);
      setSelectedProductId("");
      setQuantity(1);
      dispatch(getInventoryByBranch(Number(selectedBranchId)));
    } catch (err) {
      toast({ title: t('toast.error'), description: err || t('toast.fetchError'), variant: "destructive" });
    }
  };

  // Edit Inventory
  const handleOpenEditDialog = (row) => {
    setEditInventory(row);
    setEditQuantity(row.quantity);
    setEditProductId(row.productId);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInventory = async () => {
    if (!editInventory?.id || !selectedBranchId) return;
    try {
      await dispatch(
        updateInventory({
          id: editInventory.id,
          dto: {
            branchId: Number(selectedBranchId),
            productId: editInventory.productId,
            quantity: Number(editQuantity),
          },
        })
      ).unwrap();
      toast({ title: t('toast.success'), description: t('dashboard.branchManager.inventory.toast.updated') || "Đã cập nhật tồn kho" });
      setIsEditDialogOpen(false);
      setEditInventory(null);
      setEditQuantity(1);
      setEditProductId("");
      dispatch(getInventoryByBranch(Number(selectedBranchId)));
    } catch (err) {
      toast({ title: t('toast.error'), description: err || t('toast.fetchError'), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.store.nav.inventory') || "Quản lý tồn kho"}
          </h1>
          <p className="text-gray-400 mt-1">
            Quản lý số lượng tồn kho sản phẩm theo từng chi nhánh của cửa hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch selector for Store Admin */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-gray-300 whitespace-nowrap">Chi nhánh:</span>
            <Select
              value={selectedBranchId}
              onValueChange={(val) => setSelectedBranchId(val)}
            >
              <SelectTrigger className="w-[180px] h-9 border-none bg-transparent text-white focus:ring-0">
                <SelectValue placeholder="Chọn chi nhánh..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/90 border-white/20 text-white backdrop-blur-lg">
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!selectedBranchId}
          >
            <Plus className="h-4 w-4" />
            {t('dashboard.branchManager.inventory.addNew') || "Nhập hàng / Thêm tồn kho"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearch={(e) => setSearchTerm(e.target.value)}
        category={category}
        onCategoryChange={setCategory}
        products={products}
        inventoryRows={inventoryRows}
      />

      {/* Table */}
      <Card className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl">
        <CardContent className="p-6">
          <InventoryTable rows={filteredRows} onEdit={handleOpenEditDialog} />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <InventoryFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        quantity={quantity}
        setQuantity={setQuantity}
        onSubmit={handleAddInventory}
        mode="add"
      />
      <InventoryFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedProductId={editProductId}
        setSelectedProductId={setEditProductId}
        quantity={editQuantity}
        setQuantity={setEditQuantity}
        onSubmit={handleUpdateInventory}
        mode="edit"
      />
    </div>
  );
};

export default StoreInventory;
