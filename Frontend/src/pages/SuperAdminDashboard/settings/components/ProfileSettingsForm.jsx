import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { User, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../components/ui/use-toast";
import { updateProfile } from "../../../../Redux Toolkit/features/user/userThunks";

export default function ProfileSettingsForm({ userProfile }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.fullName || "Super Admin",
        email: userProfile.email || "admin@pospro.com",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const handleChange = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(updateProfile({ fullName: profile.name, phone: profile.phone })).unwrap();
      toast({
        title: t('superAdminModule.settings.profile.save'),
        description: t('superAdminModule.settings.profile.saveSuccess', 'Profile updated successfully.'),
      });
    } catch (error) {
      toast({
        title: t('superAdminModule.settings.profile.save'),
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 ring-2 ring-emerald-500/20">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-300">{t('superAdminModule.settings.profile.changeAvatar')}</p>
          <p className="text-xs text-gray-400">{t('superAdminModule.settings.profile.avatarHint')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="text-gray-300">{t('superAdminModule.settings.profile.fullName')}</Label>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-email" className="text-gray-300">{t('superAdminModule.settings.profile.email')}</Label>
          <Input
            id="profile-email"
            type="email"
            value={profile.email}
            readOnly
            className="bg-white/5 border-white/20 text-white placeholder-gray-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone" className="text-gray-300">{t('superAdminModule.settings.profile.phone', 'Phone Number')}</Label>
          <Input
            id="profile-phone"
            value={profile.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-32 bg-emerald-600 hover:bg-emerald-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('superAdminModule.settings.profile.save')}
        </Button>
      </div>
    </form>
  );
}
