import React from "react";
import { InventoryTable } from "@/components/inventory-table";
import ProductForm from "@/components/product-form";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminProductMore = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-4">
        <SheetHeader className="flex flex-col justify-start text-left">
          <SheetTitle className="text-lg font-semibold">
            Product Details
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            View and edit product details here.
          </SheetDescription>
        </SheetHeader>
      </div>

      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product">Edit Product</TabsTrigger>
          <TabsTrigger value="inventory">Browse Inventories</TabsTrigger>
        </TabsList>
        <TabsContent value="product" className="overflow-y-auto max-h-[80vh]">
          <ProductForm />
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
        <SheetHeader className="flex flex-col justify-start text-left">
          <SheetTitle className="text-lg font-semibold">
            Product Details
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Description of the product
          </SheetDescription>
        </SheetHeader>
      </div>
    </div>
  );
};

export { AdminProductMore, CustomerProductMore };
