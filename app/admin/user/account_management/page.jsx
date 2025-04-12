import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AccountManagement from "@/components/account-management";
const page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Edit Account</span>
        </div>
      </div>
      <AccountManagement />
    </div>
  );
};

export default page;
