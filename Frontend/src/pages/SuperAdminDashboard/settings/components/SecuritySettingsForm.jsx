import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Loader2 } from "lucide-react";
import { useSettingsState } from "./useSettingsState";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../components/ui/use-toast";
import { changePassword } from "../../../../Redux Toolkit/features/user/userThunks";

export default function SecuritySettingsForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [passwords, setPasswords] = useSettingsState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: t('superAdminModule.settings.security.updateButton'),
        description: t('superAdminModule.settings.security.passwordMismatch', 'New passwords do not match.'),
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      await dispatch(changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })).unwrap();
      localStorage.removeItem('jwt');
      window.location.assign('/auth/login');
    } catch (error) {
      toast({
        title: t('superAdminModule.settings.security.updateButton'),
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="current-password" className="text-gray-300">{t('superAdminModule.settings.security.currentPassword')}</Label>
        <Input
          id="current-password"
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords("currentPassword", e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-gray-300">{t('superAdminModule.settings.security.newPassword')}</Label>
        <Input
          id="new-password"
          type="password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords("newPassword", e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-300">{t('superAdminModule.settings.security.confirmPassword')}</Label>
        <Input
          id="confirm-password"
          type="password"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords("confirmPassword", e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder-gray-500"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-40 bg-emerald-600 hover:bg-emerald-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('superAdminModule.settings.security.updateButton')}
        </Button>
      </div>
    </form>
  );
}
