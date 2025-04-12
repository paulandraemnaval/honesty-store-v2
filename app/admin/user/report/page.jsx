import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/report-modal";
import ReportList from "@/components/report-list";
const page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 sticky z-20 p-6 top-0 backdrop-blur-xl bg-white/70 border-gray-200/70 shadow-sm">
        <div className="flex w-full">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4 mr-auto">Reports</span>
          <div className="flex gap-2">
            <Button variant="outline" className="sheets-button">
              <Table /> Report Sheets
            </Button>
            <ReportDialog />
          </div>
        </div>
      </div>
      <ReportList />
    </div>
  );
};

export default page;
