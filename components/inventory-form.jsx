import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
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
  firebaseTimestampToLongDate,
  inventoryPATCH,
  pricesSideEffect,
} from "@/lib/utils";
import { convertTimestampToDate } from "@/lib/utils";
import { inventorySchema } from "@/schemas/schemas";
import { inventoryDefaults } from "@/schemas/defaults";

export default function InventoryForm({ mode }) {
  const { selectedInventory } = useGlobalContext();
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expirationDate, setExpirationDate] = useState(
    firebaseTimestampToLongDate(selectedInventory?.inventory_expiration_date) ||
      new Date()
  );
  const [manualRetailPrice, setManualRetailPrice] = useState(false);
  const [manualProfitMargin, setManualProfitMargin] = useState(false);

  const defaults = inventoryDefaults;

  function getDefaults() {
    if (mode === "edit" && selectedInventory) {
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
          ? convertTimestampToDate(selectedInventory.inventory_expiration_date)
          : new Date(),
      };
    } else {
      return {
        ...defaults,
        inventory_profit_margin: 10,
      };
    }
  }

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["inventoryReport"],
    mutationFn: (obj) => inventoryPATCH(obj),
    onSuccess: () => {
      toast.success("Inventory report updated successfully", {});
    },
    onError: () => {
      toast.error("Failed to update inventory report");
    },
  });

  const form = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: getDefaults(),
  });

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

  // Handle checkbox toggle for manual profit margin
  const handleManualProfitMarginToggle = (checked) => {
    setManualProfitMargin(checked);
    if (checked) {
      setManualRetailPrice(false);
    } else if (!manualRetailPrice) {
      // Reset to default if both are unchecked
      const wholesalePrice = parseFloat(watchWholesalePrice) || 0;
      form.setValue("inventory_profit_margin", 10);
      form.setValue(
        "inventory_retail_price",
        parseFloat((wholesalePrice * 1.1).toFixed(2))
      );
    }
  };

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
      product_id: selectedInventory?.product_id,
      supplier_id: selectedInventory?.supplier_id,
    };
    mutateAsync(formattedValues);
  }

  return (
    <Card className="w-full mx-auto overflow-hidden pt-0">
      <CardContent className="pt-6">
        <h2 className="form-title">
          {mode === "edit" ? `Edit Inventory ` : "Create Inventory "}
        </h2>

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
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                              disabled={isPending}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div>
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                setExpirationDate(date);
                                field.onChange(date);
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
                          min="0"
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
                          min="0"
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
                          min="0"
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
                          min="0"
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
                {isPending ? "Saving..." : "Save Report"}
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
  );
}
