"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditChanges, setAuditChanges] = useState([]);
  const [formData, setFormData] = useState(null);
  const queryClient = useQueryClient();

  // Update filtered inventories whenever inventories or search term changes
  useEffect(() => {
    if (auditSearch && inventories.length > 0) {
      const filtered = inventories.filter((inventory) =>
        inventory.product.product_name
          .toLowerCase()
          .includes(auditSearch.toLowerCase())
      );
      setFilteredInventories(filtered);
    } else {
      setFilteredInventories(inventories);
    }
  }, [auditSearch, inventories]);

  const { mutate: submitAudit, isPending: isSubmitting } = useMutation({
    mutationFn: async (auditData) => {
      const response = await fetch("/api/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit audit");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Audit submitted successfully");
      setAuditChanges([]);
      setFormData(null);
      queryClient.invalidateQueries({ queryKey: ["inventoryforaudit"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit audit: ${error.message}`);
    },
  });

  const prepareAuditChanges = (formData, inventoryData) => {
    if (!formData || !inventoryData) return [];

    // Get all inventories from all pages
    const allInventories = inventoryData.pages.flatMap((page) => page.data);

    const quantities = formData.quantities;

    const changes = allInventories
      .filter((product) => {
        if (!product.inventory) return false;

        const inventoryId = product.inventory.inventory_id;
        const quantity = quantities[inventoryId]?.trim();

        return (
          quantity &&
          Number(quantity) !== product.inventory.inventory_total_units
        );
      })
      .map((product) => ({
        productName: product.product.product_name,
        productId: product.product.product_id,
        inventoryId: product.inventory.inventory_id,
        oldQuantity: product.inventory.inventory_total_units,
        newQuantity: Number(quantities[product.inventory.inventory_id]),
        deficit:
          product.inventory.inventory_total_units -
          Number(quantities[product.inventory.inventory_id]),
      }));

    setAuditChanges(changes);
    setFormData(formData);

    console.log("Audit Changes:", changes);
    return changes;
  };

  const handleSubmitAudit = () => {
    if (auditChanges.length === 0) {
      toast.info("No changes to submit");
      return;
    }

    const auditData = auditChanges.map((change) => ({
      productId: change.productId,
      remaining: change.newQuantity,
    }));

    submitAudit(auditData);
  };

  const hasAuditChanges = auditChanges.length > 0;

  const value = {
    auditChanges,
    isSubmitting,
    hasAuditChanges,
    prepareAuditChanges,
    handleSubmitAudit,
    resetAudit: () => {
      setAuditChanges([]);
      setFormData(null);
    },
    setInventories,
    inventories,
    filteredInventories,
    setAuditSearch,
    auditSearch,
  };

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}
