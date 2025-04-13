import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DashBoard from "@/components/dashboard";
const index = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Reports</span>
        </div>
      </div>
      <DashBoard />
    </div>
  );
};

export default index;
