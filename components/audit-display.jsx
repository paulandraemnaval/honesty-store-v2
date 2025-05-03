"use client";
import React from "react";
import SearchInput from "@/components/search-input";
import { SidebarTrigger } from "./ui/sidebar";
import AuditList from "./audit-list";
import AuditDialog from "./audit-modal";
import { AuditProvider, useAudit } from "@/contexts/audit-context";

const AuditDisplayContent = () => {
  const { auditSearch } = useAudit();

  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar ">
        <div className="flex mr-auto">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Audit</span>
        </div>

        <SearchInput searchFn={auditSearch} />
        <AuditDialog />
      </div>
      <AuditList />
    </div>
  );
};

const AuditDisplay = () => {
  return (
    <AuditProvider>
      <AuditDisplayContent />
    </AuditProvider>
  );
};

export default AuditDisplay;
