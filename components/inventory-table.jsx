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
} from "@/components/ui/sheet";
import {
  firebaseTimestampToYYYY_MM_DD,
  productInventoriesGET,
} from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { Loader2, RotateCw } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import InventoryForm from "./inventory-form";
import { Button } from "./ui/button";
export function InventoryTable() {
  const { selectedProduct, setSelectedInventory, selectedInventory } =
    useGlobalContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["product_inventories", selectedProduct.product_id],
    queryFn: () => productInventoriesGET(selectedProduct.product_id),
    enabled: !!selectedProduct.product_id,
  });

  const handleRowClick = (inventory) => {
    setSelectedInventory(inventory);
    setIsSheetOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  function getColors(longdate) {
    const date = new Date(longdate);
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return "text-red-300";
    } else if (diffDays <= 30) {
      return "text-orange-300";
    } else {
      return "text-green-300";
    }
  }

  return (
    <>
      <ScrollArea className="h-[75vh] pr-2 w-full">
        <Table>
          <TableCaption>
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
              <RotateCw className={`${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </TableCaption>
          <TableHeader className="w-full">
            <TableRow>
              {isFetching ? null : (
                <>
                  <TableHead className="w-fit">ID</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-left">Remaining</TableHead>
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
                {data?.data?.map((inv, index) => (
                  <TableRow
                    key={inv.inventory_id}
                    onClick={() => handleRowClick(inv)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{index}</TableCell>
                    <TableCell
                      className={`font-medium ${getColors(
                        inv?.inventory_expiration_date
                      )}`}
                    >
                      {firebaseTimestampToYYYY_MM_DD(
                        inv?.inventory_expiration_date
                      )}
                    </TableCell>
                    <TableCell className="font-medium mr-auto">
                      {inv?.inventory_total_units}
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
          <InventoryForm mode={"edit"} setIsSheetOpen={setIsSheetOpen} />
        </SheetContent>
      </Sheet>
    </>
  );
}

export default InventoryTable;
