"use client";
import React from "react";
import FilterBar from "@/components/filter-bar";
import ProductsList from "@/components/products-list";
import SearchInput from "@/components/search-input";
import AscendFilter from "@/components/ascend-filter";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Plus, PhilippinePeso } from "lucide-react";
import InventoryReport from "./inventory-report";
const ProductsDisplay = () => {
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [supplierFilter, setSupplierFilter] = React.useState("all");
  const [ascendingFilter, setAscendingFilter] = React.useState("ascending");

  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          <SidebarTrigger />
          <span className="text-2xl font-bold ml-4">Products</span>
        </div>

        <SearchInput />
        <FilterBar
          categoryFilter={categoryFilter}
          supplierFilter={supplierFilter}
        />
        <AscendFilter
          ascendingFilter={ascendingFilter}
          setAscendingFilter={setAscendingFilter}
          icon={<PhilippinePeso size={20} />}
        />

        <InventoryReport />
        <Button
          variant="ghost"
          className="px-4 py-2 bg-mainButtonColor backdrop-blur-sm border transition-colors text-white cursor-pointer"
        >
          <Plus /> Add Product
        </Button>
      </div>
      <ProductsList
        categoryFilter={categoryFilter}
        supplierFilter={supplierFilter}
        ascendingFilter={ascendingFilter}
      />
    </div>
  );
};

export default ProductsDisplay;
