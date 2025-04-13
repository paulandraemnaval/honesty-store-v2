import React from "react";
import { InventoryTable } from "@/components/inventory-table";
import ProductForm from "@/components/product-form";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminProductMore = ({}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-2">
        <SheetHeader className="sheet-header">
          <SheetTitle className="sheet-title">Product Details</SheetTitle>
          <SheetDescription className="sheet-description">
            View and edit product details here.
          </SheetDescription>
        </SheetHeader>
      </div>

      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product">Edit Product</TabsTrigger>
          <TabsTrigger value="inventory">Browse Inventories</TabsTrigger>
        </TabsList>
        <TabsContent value="product" className="max-h-[75vh]">
          <ProductForm mode={"edit"} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CustomerProductMore = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-4">
        <SheetHeader className="sheet-header">
          <SheetTitle className="sheet-title">Product Details</SheetTitle>
          <SheetDescription className="sheet-description">
            Description of the product
          </SheetDescription>
        </SheetHeader>
      </div>
    </div>
  );
};

export { AdminProductMore, CustomerProductMore };
