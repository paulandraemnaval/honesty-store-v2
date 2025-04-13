"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  firebaseTimestampToYYYY_MM_DD,
  productInventoriesGET,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import InventoryForm from "./inventory-form";

export function InventoryTable() {
  const { selectedProduct, setSelectedInventory, selectedInventory } =
    useGlobalContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["product_inventories", selectedProduct.product_id],
    queryFn: () => productInventoriesGET(selectedProduct.product_id),
    enabled: !!selectedProduct.product_id,
  });

  const handleRowClick = (inventory) => {
    setSelectedInventory(inventory);
    setIsSheetOpen(true);
  };

  return (
    <>
      <ScrollArea className="h-[75vh] pr-2 w-full">
        <Table>
          <TableCaption>Click on a row to view its details</TableCaption>
          <TableHeader className="w-full">
            <TableRow>
              {isFetching ? null : (
                <>
                  <TableHead className="w-full">Date Created</TableHead>
                  <TableHead className="text-left">ID</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow className="w-full">
                <TableCell
                  colSpan={2}
                  className="flex text-center items-center gap-2 text-muted-foreground justify-center"
                >
                  <Loader2 className="animate-spin" /> Loading...
                </TableCell>
              </TableRow>
            ) : (
              <>
                {data?.data?.map((inv) => (
                  <TableRow
                    key={inv.inventory_id}
                    onClick={() => handleRowClick(inv)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium mr-auto">
                      {firebaseTimestampToYYYY_MM_DD(inv.inventory_timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-left ">
                      {inv.inventory_id}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sheet-content">
          <SheetHeader className="sheet-header">
            <SheetTitle className="sheet-title">Inventory Details</SheetTitle>
            <SheetDescription className="sheet-description">
              Details for inventory of {selectedProduct?.product_name}
              made on{" "}
              <span className="text-black font-semibold">
                {firebaseTimestampToYYYY_MM_DD(
                  selectedInventory?.inventory_timestamp
                )}
              </span>
            </SheetDescription>
          </SheetHeader>
          <InventoryForm mode={"edit"} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export default InventoryTable;
