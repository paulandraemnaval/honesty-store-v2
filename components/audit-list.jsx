"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { firebaseTimestampToLongDate, inventoryGETforAudit } from "@/lib/utils";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAudit } from "@/contexts/audit-context";
import { inventoryGET } from "../lib/utils";

const auditSchema = z.object({
  quantities: z.record(
    z.string().refine(
      (val) => {
        if (val === "") return true; // Empty is allowed
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Must be a valid positive number" }
    )
  ),
});

const AuditList = () => {
  const {
    prepareAuditChanges,
    filteredInventories,
    inventories,
    setInventories,
  } = useAudit();

  const sentinelRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      quantities: {},
    },
  });

  const { watch, setValue } = form;
  const quantities = watch("quantities");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = "" }) => inventoryGET(pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.lastVisible || undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      const allInventories = data.pages.flatMap((page) => page.data);
      setInventories(allInventories);
    }
  }, [isSuccess, data, setInventories]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log("Loading more inventory items...");
          fetchNextPage();
        }
      },
      { rootMargin: "150px", threshold: 0.2 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const incrementQuantity = (inventoryId, currentValue, maxValue) => {
    const current = currentValue ? parseInt(currentValue) : 0;
    if (current < maxValue) {
      setValue(`quantities.${inventoryId}`, (current + 1).toString());
      if (data) {
        prepareAuditChanges(form.getValues(), data);
      }
    }
  };

  const decrementQuantity = (inventoryId, currentValue) => {
    const current = currentValue ? parseInt(currentValue) : 0;
    if (current > 0) {
      setValue(`quantities.${inventoryId}`, (current - 1).toString());
      // Prepare audit changes when values change
      if (data) {
        prepareAuditChanges(form.getValues(), data);
      }
    }
  };

  const validateQuantities = () => {
    let valid = true;
    const errors = {};

    if (!data) return false;

    // Get all inventories from all pages
    const allInventories = data.pages.flatMap((page) => page.data);

    allInventories.forEach((product) => {
      if (!product.inventory) return;

      const inventoryId = product.inventory.inventory_id;
      const quantity = quantities[inventoryId]?.trim();
      const inventoryTotal = product.inventory.inventory_total_units;

      if (quantity === "") return;

      if (Number(quantity) > inventoryTotal || Number(quantity) < 0) {
        errors[`quantities.${inventoryId}`] = {
          type: "manual",
          message: `Must be between 0 and ${inventoryTotal}`,
        };
        valid = false;
      }
    });

    if (!valid) {
      Object.entries(errors).forEach(([field, error]) => {
        form.setError(field, error);
      });
    }

    return valid;
  };

  const handleFormChange = () => {
    if (validateQuantities() && data) {
      prepareAuditChanges(form.getValues(), data);
    }
  };

  if (isLoading) {
    return <AuditSkeleton />;
  }

  const displayItems =
    filteredInventories?.length > 0 ? filteredInventories : inventories;

  return (
    <Form {...form}>
      <form onChange={handleFormChange} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-6 py-4">
          {displayItems?.map((product) => {
            if (!product.inventory) return null;
            if (product?.inventory?.inventory_total_units === 0) return null;
            if (
              new Date(
                firebaseTimestampToLongDate(
                  product.inventory.inventory_expiration_date
                )
              ) < new Date()
            )
              return null;
            const inventoryId = product.inventory.inventory_id;

            return (
              <FormField
                key={inventoryId}
                control={form.control}
                name={`quantities.${inventoryId}`}
                render={({ field }) => (
                  <FormItem>
                    <AuditItem
                      product={product}
                      field={field}
                      onIncrement={() =>
                        incrementQuantity(
                          inventoryId,
                          field.value,
                          product.inventory.inventory_total_units
                        )
                      }
                      onDecrement={() =>
                        decrementQuantity(inventoryId, field.value)
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        field.onChange(value);
                        setTimeout(() => {
                          if (data) {
                            prepareAuditChanges(form.getValues(), data);
                          }
                        }, 100);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>

        {hasNextPage !== false && (
          <div className="w-full py-4 flex justify-center" ref={sentinelRef}>
            {isFetchingNextPage && (
              <div className="loader text-sm text-muted-foreground">
                Loading more...
              </div>
            )}
          </div>
        )}

        {!isLoading && !displayItems?.length && (
          <div className="col-span-full flex items-center justify-center h-48 text-muted-foreground text-lg font-semibold">
            No inventory items found.
          </div>
        )}
      </form>
    </Form>
  );
};

const AuditItem = ({ product, field, onIncrement, onDecrement, onChange }) => {
  return (
    <Card className="overflow-hidden ">
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
            <Image
              src={
                product.product.product_image_url ||
                "/defaultImages/placeholder_image.png"
              }
              alt="product_image"
              fill
              className="rounded-md border shadow-2xs object-contain"
            />
          </div>

          <div className="flex flex-col w-full  truncate">
            {/* Product details */}

            <FormLabel className="text-sm text-gray-500 truncate block w-full">
              {product.product.product_name}
            </FormLabel>
            <span className="font-semibold text-base sm:text-lg block truncate">
              {product.inventory.inventory_total_units} units
            </span>

            <div className="w-full flex flex-wrap justify-between  items-center gap-2 mt-2">
              <span className="text-sm ">New quantity:</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={onDecrement}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <FormControl>
                  <Input
                    className="w-14 sm:w-16 px-2 text-center"
                    type="text"
                    {...field}
                    onChange={onChange}
                    value={field.value || ""}
                  />
                </FormControl>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={onIncrement}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AuditSkeleton = () => {
  const skeletonItems = Array(6).fill(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-2 sm:px-4 md:px-6 py-4">
      {skeletonItems.map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
              <div className="flex flex-col w-full">
                <Skeleton className="h-3 sm:h-4 w-3/4 mb-2" />
                <Skeleton className="h-5 sm:h-6 w-1/2 mb-2 sm:mb-3" />
                <div className="w-full flex flex-wrap justify-between sm:justify-end items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-14 sm:w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AuditList;
