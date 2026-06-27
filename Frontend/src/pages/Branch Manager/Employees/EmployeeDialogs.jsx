import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeForm } from "../../store/Employee";
import { Plus } from "lucide-react";
import { branchAdminRole } from "../../../utils/userRole";
import { useTranslation } from "react-i18next";

export const AddEmployeeDialog = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleAddEmployee,
  roles,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> {t('dashboard.branchManager.employees.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold">{t('dashboard.branchManager.employees.addNew')}</DialogTitle>
          <p className="text-gray-300 mt-2">{t('storeModule.employees.enterDetails')}</p>
        </DialogHeader>
        <EmployeeForm
          initialData={null}
          onSubmit={handleAddEmployee}
          roles={roles}
        />
      </DialogContent>
    </Dialog>
  );
};

export const EditEmployeeDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedEmployee,
  handleEditEmployee,
  roles,
}) => {
  const { t } = useTranslation();
  return (
    selectedEmployee && (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold">{t('common.edit')} {t('dashboard.branchManager.employees.table.role')}</DialogTitle>
            <p className="text-gray-300 mt-2">{t('storeModule.employees.updateDetails')}</p>
          </DialogHeader>
          <EmployeeForm
            initialData={
              selectedEmployee
                ? {
                  ...selectedEmployee,
                  branchId: selectedEmployee.branchId || "",
                }
                : null
            }
            onSubmit={handleEditEmployee}
            roles={roles}
          />
        </DialogContent>
      </Dialog>
    )
  );
};

export const ResetPasswordDialog = ({
  isResetPasswordDialogOpen,
  setIsResetPasswordDialogOpen,
  selectedEmployee,
  handleResetPassword,
}) => {
  const { t } = useTranslation();
  return (
    selectedEmployee && (
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">{t('dashboard.branchManager.employees.resetPassword.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              {t('dashboard.branchManager.employees.resetPassword.confirm', { name: selectedEmployee.fullName })}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {t('dashboard.branchManager.employees.resetPassword.instruction')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleResetPassword} className="bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {t('dashboard.branchManager.employees.resetPassword.title')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
};

export const PerformanceDialog = ({
  isPerformanceDialogOpen,
  setIsPerformanceDialogOpen,
  selectedEmployee,
}) => {
  const { t } = useTranslation();
  return (
    selectedEmployee && (
      <Dialog
        open={isPerformanceDialogOpen}
        onOpenChange={setIsPerformanceDialogOpen}
      >
        <DialogContent className="max-w-3xl bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold">
              {t('dashboard.branchManager.employees.performance.title')} - {selectedEmployee.fullName || selectedEmployee.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-10 text-center">
            <p className="text-gray-400 text-lg">
              {t('dashboard.branchManager.employees.performance.noData', 'Chưa có dữ liệu hiệu suất cho nhân viên này.')}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPerformanceDialogOpen(false)} className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {t('common.close')}
            </Button>
            <Button variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
              {t('dashboard.branchManager.transactions.export')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
};
