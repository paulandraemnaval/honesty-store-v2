import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SectionCards } from "@/components/dashboard-cards";
import { IncomeChart } from "@/components/area-chart";
import RevenueChart from "@/components/bar-chart";
const index = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Reports</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full px-6 py-4">
        <SectionCards
          title="Total Revenue"
          amount="$100,000"
          icon="dollar-sign"
        />
        <div className="grid grid-rows-1 grid-cols-2 gap-4">
          <IncomeChart />
          <RevenueChart />
        </div>
      </div>
    </div>
  );
};

export default index;
