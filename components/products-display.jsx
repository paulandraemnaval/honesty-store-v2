"use client";
import React from "react";
import FilterBar from "@/components/filter-bar";
import ProductsList from "@/components/products-list";
import SearchInput from "@/components/search-input";
import AscendFilter from "@/components/ascend-filter";
import { SidebarTrigger } from "./ui/sidebar";
import { PhilippinePeso } from "lucide-react";
import InventoryReport from "./inventory-report";
import Image from "next/image";
import icons from "@/constants/icons";
import { usePathname } from "next/navigation";
import AddProduct from "./add-product";
const ProductsDisplay = ({ customer }) => {
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [supplierFilter, setSupplierFilter] = React.useState("all");
  const [ascendingFilter, setAscendingFilter] = React.useState("ascending");
  const pathName = usePathname();
  return (
    <div className="flex flex-col gap-4">
      <div className="top-bar">
        <div className="flex">
          {pathName.includes("admin") ? <SidebarTrigger /> : null}
          {pathName.includes("admin") ? (
            <span className="text-2xl font-bold ml-4">Products</span>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src={icons.logo}
                alt="logo"
                width={40}
                height={40}
                className="rounded-md bg-mainButtonColor"
              />
              <span className="text-2xl font-bold ml-4 text-mainButtonColor">
                Honesty Store
              </span>
            </div>
          )}
        </div>

        <SearchInput />
        {pathName.includes("admin") ? (
          <FilterBar
            categoryFilter={categoryFilter}
            supplierFilter={supplierFilter}
          />
        ) : null}
        <AscendFilter
          ascendingFilter={ascendingFilter}
          setAscendingFilter={setAscendingFilter}
          icon={<PhilippinePeso size={20} />}
        />

        {pathName.includes("admin") ? (
          <>
            <InventoryReport />
            <AddProduct />
          </>
        ) : null}
      </div>
      <ProductsList
        categoryFilter={categoryFilter}
        supplierFilter={supplierFilter}
        ascendingFilter={ascendingFilter}
        customer={customer}
      />
    </div>
  );
};

export default ProductsDisplay;
