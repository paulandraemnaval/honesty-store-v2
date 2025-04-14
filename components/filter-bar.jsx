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

export function FilterBar() {
  const [formType, setFormType] = useState("");
  const [mode, setMode] = useState("");

  function handleClick(type, mode) {
    setMode(mode);
    setFormType(type);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className=" w-fit flex-row-reverse">
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

              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2 w-full ">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1" className="mr-auto">
                    Default
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="r2" />
                  <Label htmlFor="r2">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="r3" />
                  <Label htmlFor="r3">Compact</Label>
                </div>
              </RadioGroup>
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

              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="r2" />
                  <Label htmlFor="r2">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="r3" />
                  <Label htmlFor="r3">Compact</Label>
                </div>
              </RadioGroup>
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

export default FilterBar;
