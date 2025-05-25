import React from "react";
import {
  SheetTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import ProductForm from "./product-form";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AddProduct() {
  const isMobile = useIsMobile();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="custom-form-button">
          <Plus />
          {isMobile ? "" : "Add Product"}
        </Button>
      </SheetTrigger>

      <SheetContent className="sheet-content px-6  gap-2">
        <SheetTitle>
          <h2 className="font-bold text-2xl mt-8">Add New Product</h2>
        </SheetTitle>
        <SheetDescription className="mb-4">
          Fill out the form below to add a new product to the Honesty Store.
        </SheetDescription>
        <ProductForm mode={"add"} />
      </SheetContent>
    </Sheet>
  );
}
