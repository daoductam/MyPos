import React from "react";
import { useSelector } from "react-redux";
import { User } from "lucide-react";
import OperationalNotificationsPopover from "@/components/notifications/OperationalNotificationsPopover";

export default function BranchManagerTopbar() {
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);

  return (
    <header className="h-20 px-6 md:px-8 lg:px-10 flex-shrink-0 z-20">
      <div className="h-full flex items-center justify-between bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl px-6">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {branch ? branch.name : "Branch Dashboard"}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <OperationalNotificationsPopover branchId={branch?.id} />

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{userProfile?.fullName || "Branch Manager"}</p>
              <p className="text-xs text-gray-400">{userProfile?.email || "manager@example.com"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
