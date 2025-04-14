"use client";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MoreHorizontal } from "lucide-react";
import CategoryForm from "@/components/category-form";
import SupplierForm from "@/components/supplier-form";
import { useState } from "react";
import FormRadioGroup from "./radio-group";
import { useGlobalContext } from "@/contexts/global-context";

export default function FilterBar() {
  const {
    categories,
    categoryFilter,
    setCategoryFilter,
    suppliers,
    supplierFilter,
    setSupplierFilter,
    catLoading,
    supLoading,
  } = useGlobalContext();
  const [formType, setFormType] = useState("");
  const [mode, setMode] = useState("");

  function handleClick(type, mode) {
    setMode(mode);
    setFormType(type);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className=" w-fit flex-row-reverse"
          disabled={catLoading || supLoading}
        >
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="px-4 py-4 gap-2">
        <SheetHeader>
          <SheetTitle>Filter Bar</SheetTitle>
          <SheetDescription>
            Filter the displayed products here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Sheet>
          <div className="flex flex-col gap-4">
            <div className="px-4 py-4 flex flex-col gap-4 border shadow-2xs rounded-md">
              <div className="flex w-full items-center gap-2">
                <Label htmlFor="Catergory" className="mr-auto">
                  Category
                </Label>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleClick("Category", "Create");
                    }}
                  >
                    <MoreHorizontal />
                  </Button>
                </SheetTrigger>
              </div>

              <FormRadioGroup
                data={categories}
                currentSelected={categoryFilter}
                setSelected={setCategoryFilter}
                label_attr={"category_name"}
                value_attr={"category_id"}
              />
            </div>
            <div className="px-4 py-4 flex flex-col gap-4 border shadow-2xs rounded-md">
              <div className="flex w-full items-center gap-2">
                <Label htmlFor="Catergory" className="mr-auto">
                  Supplier
                </Label>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleClick("Supplier", "Create");
                    }}
                  >
                    <MoreHorizontal />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="px-4 py-4 gap-2">
                  <SheetHeader>
                    <SheetTitle>{`${formType}`}</SheetTitle>
                    <SheetDescription>
                      {`View the deatils of ${formType}. Press save when
                      finshed editing to save your changes.`}
                    </SheetDescription>
                  </SheetHeader>
                  {formType === "Category" ? (
                    <CategoryForm />
                  ) : (
                    <SupplierForm />
                  )}
                </SheetContent>
              </div>

              <FormRadioGroup
                data={suppliers}
                currentSelected={supplierFilter}
                setSelected={setSupplierFilter}
                label_attr={"supplier_name"}
                value_attr={"supplier_id"}
              />
            </div>
          </div>
        </Sheet>
        <SheetFooter>
          <SheetClose asChild>
            <Button className="custom-form-button">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
