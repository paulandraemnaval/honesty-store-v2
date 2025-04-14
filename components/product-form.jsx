"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalContext } from "@/contexts/global-context";
import ComboBox from "./combo-box";
import Image from "next/image";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { productPATCH, productPOST } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { productSchema } from "@/schemas/schemas";
import { productDefaults } from "@/schemas/defaults";

export default function ProductForm({ mode }) {
  const { selectedProduct, categories } = useGlobalContext();
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    mode === "edit" ? selectedProduct?.product_image_url : null
  );
  const [selectedCategory, setSelectedCategory] = useState(
    mode === "edit" ? selectedProduct?.product_category : null
  );

  const fileInputRef = useRef(null);

  const defaults = productDefaults;

  function getDefualts() {
    if (mode === "edit") {
      return {
        ...defaults,
        product_name: selectedProduct?.product_name,
        file: selectedProduct?.product_image_url,
        product_reorder_point: selectedProduct?.product_reorder_point,
        product_description: selectedProduct?.product_description,
        product_sku: selectedProduct?.product_sku,
        product_uom: selectedProduct?.product_uom,
        product_weight: selectedProduct?.product_weight,
        product_dimension: selectedProduct?.product_dimension,
        product_category: selectedProduct?.product_category,
      };
    } else {
      return defaults;
    }
  }

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["product"],
    mutationFn: (obj) => {
      if (mode === "edit") {
        return productPATCH({
          ...obj,
          product_id: selectedProduct?.product_id,
        });
      } else if (mode === "add") {
        return productPOST(obj);
      }
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: getDefualts(),
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("file", file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    form.setValue("file", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function onSubmit(values) {
    console.log(values);
    mutateAsync({
      ...values,
      product_category: selectedCategory,
    }).then(() => {
      if (mode === "add") {
        form.reset();
        setImagePreview(null);
        setSelectedCategory(null);
      }
    });
  }

  return (
    <Card className="w-full mx-auto overflow-hidden pt-0">
      <CardContent className="pt-6">
        <h2 className="form-title">
          {mode === "edit"
            ? `Edit ${selectedProduct?.product_name}`
            : "Add New Product"}
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
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div
                          onClick={handleImageClick}
                          className={`border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center ${
                            isPending ? "cursor-not-allowed" : "cursor-pointer"
                          } bg-muted relative overflow-hidden`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                            disabled={isPending}
                          />

                          {imagePreview ? (
                            <>
                              <Image
                                src={imagePreview}
                                alt="Product preview"
                                className="h-full w-full object-contain"
                                fill
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">
                                Click to upload product image
                              </p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Category</FormLabel>
                      <FormControl>
                        <ComboBox
                          datatype={"Product Category"}
                          data={categories}
                          defaultValue={
                            mode === "edit" ? selectedCategory : null
                          }
                          setSelectedValue={setSelectedCategory}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reorder Point */}
                <FormField
                  control={form.control}
                  name="product_reorder_point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum stock level before reordering
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Fields Section */}
              <div
                className={`space-y-6 ${
                  showOptionalFields ? "block" : "hidden"
                }`}
              >
                {/* Description */}
                <FormField
                  control={form.control}
                  name="product_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="resize-none"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SKU */}
                <FormField
                  control={form.control}
                  name="product_sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product SKU"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unit of Measure */}
                <FormField
                  control={form.control}
                  name="product_uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Each, Box, Kg"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight */}
                <FormField
                  control={form.control}
                  name="product_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1.5 kg"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dimensions */}
                <FormField
                  control={form.control}
                  name="product_dimension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10 x 5 x 3 cm"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            {/* Form Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="custom-form-button"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Product"}
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
