"use client";
import { Button } from "@/components/ui/button";
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
import { Box, Filter, MoreHorizontal, PhilippinePeso } from "lucide-react";
import CategoryForm from "@/components/category-form";
import SupplierForm from "@/components/supplier-form";
import { useState } from "react";
import FormRadioGroup from "./radio-group";
import { useGlobalContext } from "@/contexts/global-context";
import { useIsMobile } from "@/hooks/use-mobile";
import AscendFilter from "./ascend-filter";
import { ScrollArea } from "@radix-ui/react-scroll-area";

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
    ascendingPrice,
    togglePriceSort,
    ascendingUnits,
    toggleUnitSort,
  } = useGlobalContext();
  const [formType, setFormType] = useState("");
  const [mode, setMode] = useState("");
  const isMobile = useIsMobile();

  function handleClick(type, mode) {
    setMode(mode);
    setFormType(type);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          disabled={catLoading || supLoading}
          size={isMobile ? "icon" : "default"}
        >
          {isMobile ? <Filter /> : "Filter"}
        </Button>
      </SheetTrigger>
      <SheetContent className="px-6 py-4 gap-2 ">
        <SheetHeader className="px-0">
          <SheetTitle>Filter Bar</SheetTitle>
          <SheetDescription>
            Filter the displayed products here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full w-full overflow-y-auto pr-4">
          <div className="flex  gap-4 mb-4">
            <Label className="text-sm font-semibold mr-auto">
              Product Ordering
            </Label>
            <AscendFilter
              ascendingFilter={ascendingPrice}
              setAscendingFilter={togglePriceSort}
              icon={<PhilippinePeso size={20} />}
              AscendTrueMessage={"Priciest at the top"}
              AscendFalseMessage={"Cheapest at the top"}
            />
            <AscendFilter
              ascendingFilter={ascendingUnits}
              setAscendingFilter={toggleUnitSort}
              icon={<Box size={20} />}
              AscendTrueMessage={"Most units at the top"}
              AscendFalseMessage={"Least units at the top"}
            />
          </div>
          <Sheet>
            <div className="flex flex-col gap-4">
              <Label className="text-sm font-semibold">Product Filters</Label>
              <div className="px-4 py-4 flex flex-col gap-4 border shadow-2xs rounded-md flex-1">
                <div className="flex w-full items-center gap-2 h-full flex-1">
                  <Label className="mr-auto font-semibold">Category</Label>
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
              <div className="px-4 py-4 flex flex-col gap-4 border shadow-2xs rounded-md flex-1">
                <div className="flex w-full items-center gap-2">
                  <Label className="mr-auto font-semibold">Supplier</Label>
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
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button className="custom-form-button">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
