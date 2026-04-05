import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { updateBranch } from "../../../Redux Toolkit/features/branch/branchThunks";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Clock, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Checkbox } from "../../../components/ui/checkbox";
import { useTranslation } from "react-i18next";

const BranchInfo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  
  const [branchInfo, setBranchInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    openingTime: "",
    closingTime: "",
    workingDays: [],
  });

  useEffect(() => {
    if (branch) {
      setBranchInfo({
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        openingTime: branch.openingTime || "",
        closingTime: branch.closingTime || "",
        workingDays: branch.workingDays || [],
      });
    }
  }, [branch]);

  const handleBranchInfoChange = (field, value) => {
    setBranchInfo({
      ...branchInfo,
      [field]: value,
    });
  };

  const handleSaveSettings = () => {
    if (branch?.id) {
      dispatch(
        updateBranch({
          id: branch.id,
          dto: branchInfo,
          jwt: localStorage.getItem("jwt"),
        })
      );
    }
  };

  const daysOfWeek = [
    { id: "monday", label: t('dashboard.branchManager.settings.info.days.monday'), value: "Monday" },
    { id: "tuesday", label: t('dashboard.branchManager.settings.info.days.tuesday'), value: "Tuesday" },
    { id: "wednesday", label: t('dashboard.branchManager.settings.info.days.wednesday'), value: "Wednesday" },
    { id: "thursday", label: t('dashboard.branchManager.settings.info.days.thursday'), value: "Thursday" },
    { id: "friday", label: t('dashboard.branchManager.settings.info.days.friday'), value: "Friday" },
    { id: "saturday", label: t('dashboard.branchManager.settings.info.days.saturday'), value: "Saturday" },
    { id: "sunday", label: t('dashboard.branchManager.settings.info.days.sunday'), value: "Sunday" },
  ];

  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-white">{t('dashboard.branchManager.settings.info.title')}</CardTitle>
        <CardDescription className="text-gray-400">
          {t('dashboard.branchManager.settings.info.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="branch-name" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.name')}
              </label>
              <Input
                id="branch-name"
                className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                value={branchInfo.name}
                onChange={(e) => handleBranchInfoChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="branch-address" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.address')}
              </label>
              <Input
                id="branch-address"
                className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                value={branchInfo.address}
                onChange={(e) => handleBranchInfoChange("address", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="branch-phone" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.phone')}
              </label>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="branch-phone"
                  className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                  value={branchInfo.phone}
                  onChange={(e) => handleBranchInfoChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="branch-email" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.email')}
              </label>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="branch-email"
                  className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                  type="email"
                  value={branchInfo.email}
                  onChange={(e) => handleBranchInfoChange("email", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10"/>

        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-200">{t('dashboard.branchManager.settings.info.hours')}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="opening-time" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.opening')}
              </label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="opening-time"
                  className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                  type="time"
                  value={branchInfo.openingTime}
                  onChange={(e) => handleBranchInfoChange("openingTime", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="closing-time" className="text-sm font-medium text-gray-300">
                {t('dashboard.branchManager.settings.info.closing')}
              </label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="closing-time"
                  className="w-full pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                  type="time"
                  value={branchInfo.closingTime}
                  onChange={(e) => handleBranchInfoChange("closingTime", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-300">{t('dashboard.branchManager.settings.info.workingDays')}</label>
            <div className="grid grid-cols-2 gap-2 mt-2 md:grid-cols-4">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={branchInfo.workingDays.includes(day.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleBranchInfoChange("workingDays", [
                          ...branchInfo.workingDays,
                          day.value,
                        ]);
                      } else {
                        handleBranchInfoChange(
                          "workingDays",
                          branchInfo.workingDays.filter((d) => d !== day.value)
                        );
                      }
                    }}
                  />
                  <label htmlFor={`day-${day.id}`} className="text-sm text-gray-300">
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={handleSaveSettings}
          >
            <Save className="h-4 w-4" />
            {t('dashboard.branchManager.settings.info.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchInfo;
