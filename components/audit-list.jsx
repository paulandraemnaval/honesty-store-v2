"use client";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { inventoryGETforAudit } from "@/lib/utils";
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
  const { prepareAuditChanges } = useAudit();

  const form = useForm({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      quantities: {},
    },
  });

  const { watch, setValue } = form;
  const quantities = watch("quantities");

  const { data, isLoading } = useQuery({
    queryKey: ["inventoryforaudit"],
    queryFn: () => inventoryGETforAudit(),
  });

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

    if (!data || !data.data) return false;

    data.data.forEach((product) => {
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

  return (
    <Form {...form}>
      <form onChange={handleFormChange} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full px-6 py-4">
          {data.data?.map((product) => {
            if (!product.inventory) return null;
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
      </form>
    </Form>
  );
};

const AuditItem = ({ product, field, onIncrement, onDecrement, onChange }) => {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="px-4 h-full">
        <div className="flex items-center h-full gap-6">
          <div className="relative h-22 w-22 object-fit aspect-[4/3]">
            <Image
              src={
                product.product.product_image_url ||
                "/defaultImages/placeholder_image.png"
              }
              alt="product_image"
              fill
              className="rounded-md border shadow-2xs"
            />
          </div>
          <div className="flex flex-col pt-6 pb-4 w-full">
            <FormLabel className="text-sm text-gray-500 max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis block">
              {product.product.product_name}
            </FormLabel>
            <span className="font-semibold text-lg">
              {product.inventory.inventory_total_units} units
            </span>
            <div className="w-full flex justify-end items-center gap-2">
              <span className="text-sm">New quantity:</span>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={onIncrement}
              >
                <Plus />
              </Button>
              <FormControl>
                <Input
                  className="w-18"
                  type="text"
                  {...field}
                  onChange={onChange}
                />
              </FormControl>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={onDecrement}
              >
                <Minus />
              </Button>
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full px-6 py-4">
      {skeletonItems.map((_, index) => (
        <Card key={index} className="overflow-hidden p-0">
          <CardContent className="px-4 h-full">
            <div className="flex items-center h-full gap-6">
              <div className="relative h-22 w-22 object-fit aspect-[4/3]">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
              <div className="flex flex-col pt-6 pb-4 w-full">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="w-full flex justify-end items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-18" />
                  <Skeleton className="h-8 w-8" />
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
