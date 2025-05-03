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

      <SheetContent className="sheet-content">
        <ProductForm mode={"add"} />
      </SheetContent>
    </Sheet>
  );
}
