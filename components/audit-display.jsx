"use client";
import React from "react";
import FilterBar from "@/components/filter-bar";
import SearchInput from "@/components/search-input";
import AscendFilter from "@/components/ascend-filter";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "@/components/ui/button";
import AuditList from "./audit-list";
import AuditDialog from "./audit-modal";
import { Package } from "lucide-react";
const AuditDisplay = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Audit</span>
        </div>

        <SearchInput />
        <FilterBar
          categoryFilter={categoryFilter}
          supplierFilter={supplierFilter}
        />
        <AscendFilter
          ascendingFilter={ascendingFilter}
          setAscendingFilter={setAscendingFilter}
          icon={<Package size={20} />}
        />
        <AuditDialog />
      </div>
      <AuditList
        categoryFilter={categoryFilter}
        supplierFilter={supplierFilter}
        ascendingFilter={ascendingFilter}
      />
    </div>
  );
};

export default AuditDisplay;
