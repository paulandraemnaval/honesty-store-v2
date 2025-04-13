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

export default function AddProduct() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="custom-form-button">
          <Plus />
          Add Product
        </Button>
      </SheetTrigger>

      <SheetContent className="sheet-content">
        <SheetHeader className="sheet-header">
          <SheetTitle className="sheet-title">Add Product</SheetTitle>
          <SheetDescription className="sheet-description">
            Add a new product to the inventory.
          </SheetDescription>
        </SheetHeader>
        <ProductForm mode={"add"} />
      </SheetContent>
    </Sheet>
  );
}
