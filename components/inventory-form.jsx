import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { format, set } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

import { useGlobalContext } from "@/contexts/global-context";

import {
  convertTimestampToDate,
  firebaseTimestampToLongDate,
  inventoryPATCH,
  pricesSideEffect,
  inventoryPOST,
  inventoryDELETE,
  firebaseTimestampToYYYY_MM_DD,
} from "@/lib/utils";
import { inventorySchema } from "@/schemas/schemas";
import { inventoryDefaults } from "@/schemas/defaults";
import { SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import ComboBox from "./combo-box";
import DeleteButton from "./delete-button";

export default function InventoryForm({ mode, setIsSheetOpen }) {
  const queryClient = useQueryClient();

  const { selectedInventory, selectedProduct, suppliers } = useGlobalContext();

  const [selectedSupplier, setSelectedSupplier] = useState(
    mode === "edit" ? selectedInventory?.supplier_id : null
  );

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [_, setExpirationDate] = useState();
  const [manualRetailPrice, setManualRetailPrice] = useState(false);
  const [manualProfitMargin, setManualProfitMargin] = useState(false);

  const defaults = inventoryDefaults;

  useEffect(() => {
    if (
      mode === "edit" &&
      selectedInventory?.supplier_id &&
      suppliers?.length > 0
    ) {
      setSelectedSupplier(selectedInventory.supplier_id);
    }
  }, [selectedInventory, suppliers, mode]);

  function getDefaults() {
    if (mode === "edit") {
      return {
        ...defaults,
        inventory_wholesale_price:
          selectedInventory?.inventory_wholesale_price || 0,
        inventory_total_units: selectedInventory?.inventory_total_units || 0,
        inventory_retail_price: selectedInventory?.inventory_retail_price || 0,
        inventory_description: selectedInventory?.inventory_description || "",
        inventory_profit_margin:
          selectedInventory?.inventory_profit_margin || 10,
        inventory_expiration_date: selectedInventory?.inventory_expiration_date
          ? firebaseTimestampToLongDate(
              selectedInventory.inventory_expiration_date
            )
          : null,
        supplier_id: selectedInventory?.supplier_id,
      };
    } else {
      return {
        ...defaults,
        inventory_profit_margin: 10,
      };
    }
  }

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["inventory"],
    mutationFn: (obj) => {
      return mode === "edit" ? inventoryPATCH(obj) : inventoryPOST(obj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product_inventories"]);
    },
  });

  const form = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: getDefaults(),
  });

  useEffect(() => {
    if (mode === "edit" && selectedInventory) {
      form.reset(getDefaults());

      if (selectedInventory?.inventory_expiration_date) {
        const date = convertTimestampToDate(
          selectedInventory.inventory_expiration_date
        );
        setExpirationDate(date);
      }
    }
  }, [selectedInventory, mode]);

  const watchWholesalePrice = form.watch("inventory_wholesale_price");
  const watchRetailPrice = form.watch("inventory_retail_price");
  const watchProfitMargin = form.watch("inventory_profit_margin");

  useEffect(() => {
    pricesSideEffect(
      form,
      watchWholesalePrice,
      watchRetailPrice,
      watchProfitMargin,
      manualRetailPrice,
      manualProfitMargin
    );
  }, [
    watchWholesalePrice,
    watchRetailPrice,
    watchProfitMargin,
    manualRetailPrice,
    manualProfitMargin,
    form,
  ]);

  const handleManualRetailPriceToggle = (checked) => {
    setManualRetailPrice(checked);
    if (checked) {
      setManualProfitMargin(false);
    } else if (!manualProfitMargin) {
      const wholesalePrice = parseFloat(watchWholesalePrice) || 0;
      form.setValue("inventory_profit_margin", 10);
      form.setValue(
        "inventory_retail_price",
        parseFloat((wholesalePrice * 1.1).toFixed(2))
      );
    }
  };

  const handleManualProfitMarginToggle = (checked) => {
    setManualProfitMargin(checked);
    if (checked) {
      setManualRetailPrice(false);
    } else if (!manualRetailPrice) {
      const wholesalePrice = parseFloat(watchWholesalePrice) || 0;
      form.setValue("inventory_profit_margin", 10);
      form.setValue(
        "inventory_retail_price",
        parseFloat((wholesalePrice * 1.1).toFixed(2))
      );
    }
  };

  function getProductId() {
    if (mode === "edit") {
      return selectedInventory?.product_id;
    } else if (mode === "add") {
      return selectedProduct?.product_id;
    }
  }

  function onSubmit(values) {
    const formattedValues = {
      ...values,
      inventory_id: selectedInventory?.inventory_id,
      inventory_expiration_date: values.inventory_expiration_date,
      inventory_wholesale_price: parseFloat(
        parseFloat(values.inventory_wholesale_price).toFixed(2)
      ),
      inventory_retail_price: parseFloat(
        parseFloat(values.inventory_retail_price).toFixed(2)
      ),
      inventory_profit_margin: parseFloat(
        parseFloat(values.inventory_profit_margin).toFixed(2)
      ),
      product_id: getProductId(),
    };

    mutateAsync(formattedValues).then(({ status }) => {
      if (status === 200) {
        toast.success(
          `Inventory ${mode === "edit" ? "edited" : "made"} successfully`,
          {}
        );
        setIsSheetOpen(false);
        form.reset(defaults);
        setSelectedSupplier(null);
        setExpirationDate(null);
        setManualRetailPrice(false);
        setManualProfitMargin(false);
        setShowOptionalFields(false);
      } else {
        toast.error(
          `Failed to ${mode === "edit" ? "edit" : "make"} inventory report`,
          {}
        );
      }
    });
  }

  useEffect(() => {
    console.log(
      "Selected Inventory exp:",
      selectedInventory?.inventory_expiration_date
    );
    console.log(
      firebaseTimestampToLongDate(selectedInventory?.inventory_expiration_date)
    );
  }, [selectedInventory]);

  const { mutateAsync: deleteInventory, isPending: deleteLoading } =
    useMutation({
      mutationKey: ["delete-inventory"],
      mutationFn: () => inventoryDELETE(selectedInventory?.inventory_id),
      onSuccess: () => {
        queryClient.invalidateQueries(["product_inventories"]);
        toast.success("Inventory deleted successfully", {});
      },
      onError: () => {
        toast.error("Failed to delete inventory report");
      },
    });

  function handleDelete() {
    deleteInventory().then(() => {
      setIsSheetOpen(false);
      form.reset(defaults);
      setSelectedSupplier(null);
      setExpirationDate(null);
      setManualRetailPrice(false);
      setManualProfitMargin(false);
      setShowOptionalFields(false);
    });
  }
  return (
    <>
      {mode === "add" ? (
        <>
          <SheetHeader className="sheet-header">
            <SheetTitle className="sheet-title">Inventory Details</SheetTitle>
            <SheetDescription className="sheet-description">
              Create an inventory for the product{" "}
              {selectedProduct?.product_name}
            </SheetDescription>
          </SheetHeader>
        </>
      ) : null}

      <Card className="w-full mx-auto overflow-hidden pt-0">
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors", errors);
              })}
              className="space-y-6"
            >
              <ScrollArea className="form-scroll-area">
                <div
                  className={`space-y-4 ${
                    showOptionalFields ? "hidden" : "block"
                  }`}
                >
                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="justify-between">
                          Supplier*
                          {mode === "edit" && (
                            <DeleteButton
                              deleteFn={handleDelete}
                              isLoading={deleteLoading}
                              entityName="inventory"
                            />
                          )}
                        </FormLabel>
                        <FormControl>
                          <ComboBox
                            data={suppliers ?? []}
                            datatype="Supplier"
                            value={selectedSupplier}
                            onChange={(sid) => {
                              form.setValue("supplier_id", sid);
                              setSelectedSupplier(sid);
                            }}
                            disabled={isPending}
                            name_attr="supplier_name"
                            id_attr="supplier_id"
                          />
                        </FormControl>
                        <FormDescription>
                          Select the supplier for this inventory item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inventory_expiration_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expiration Date*</FormLabel>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal`}
                                disabled={isPending}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div>
                              <CalendarComponent
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setExpirationDate(date);
                                  setCalendarOpen(false);
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                classNames={{
                                  day_selected: "bg-mainButtonColor text-white",
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When this inventory item expires
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Units */}
                  <FormField
                    control={form.control}
                    name="inventory_total_units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Units*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            disabled={isPending}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(value < 0 ? 0 : value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Total quantity in inventory
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Wholesale Price */}
                  <FormField
                    control={form.control}
                    name="inventory_wholesale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wholesale Price*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            disabled={isPending}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(value < 0 ? 0 : value);
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(parseFloat(value.toFixed(2)));
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Cost price of the inventory item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price calculation options */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="font-medium">Price Calculation Options</h3>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manual-retail"
                        checked={manualRetailPrice}
                        onCheckedChange={handleManualRetailPriceToggle}
                        disabled={isPending}
                        className={"form-checkbox"}
                      />
                      <label
                        htmlFor="manual-retail"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Set retail price manually
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manual-margin"
                        checked={manualProfitMargin}
                        onCheckedChange={handleManualProfitMarginToggle}
                        disabled={isPending}
                        className={"form-checkbox"}
                      />
                      <label
                        htmlFor="manual-margin"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Set profit margin manually
                      </label>
                    </div>

                    {!manualRetailPrice && !manualProfitMargin && (
                      <p className="text-sm text-muted-foreground">
                        Using default 10% profit margin
                      </p>
                    )}
                  </div>

                  {/* Retail Price */}
                  <FormField
                    control={form.control}
                    name="inventory_retail_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retail Price*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            disabled={isPending || !manualRetailPrice}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(value < 0 ? 0 : value);
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(parseFloat(value.toFixed(2)));
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {manualRetailPrice
                            ? "Enter your desired retail price"
                            : "Retail price calculated automatically"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profit Margin */}
                  <FormField
                    control={form.control}
                    name="inventory_profit_margin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Margin (%)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            disabled={isPending || !manualProfitMargin}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(value < 0 ? 0 : value);
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                field.onChange(parseFloat(value.toFixed(2)));
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {manualProfitMargin
                            ? "Enter your desired profit margin"
                            : "Profit margin calculated automatically"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields */}
                <div
                  className={`space-y-6 ${
                    showOptionalFields ? "block" : "hidden"
                  }`}
                >
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="inventory_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter inventory description"
                            className="resize-none"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="custom-form-button"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending ? "Saving..." : "Save Inventory"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex items-center gap-2"
                >
                  {showOptionalFields ? (
                    <>
                      <ChevronLeft size={16} />
                      Required Fields
                    </>
                  ) : (
                    <>
                      Optional Fields
                      <ChevronRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
