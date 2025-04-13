"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, ChevronLeft, Upload, X } from "lucide-react";

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
import ComboBox from "./combo-box";

const formSchema = z.object({
  category_name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  category_description: z.string().optional(),
  category_image: z.instanceof(File, {
    message: "Category image is required.",
  }),
});

export default function CategoryForm({ method }) {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: "",
      category_description: "",
      category_image: undefined,
    },
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("productImage", file);
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
    form.setValue("productImage", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function onSubmit(values) {
    console.log(values);
    // implement your form submission logic here
    alert("Product saved successfully!");
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-auto pt-0 ">
      <CardContent className="pt-6 gap-2">
        {method === "Edit" ? (
          <div className="mb-4">
            <ComboBox name={"Category"} />
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Image <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      onClick={handleImageClick}
                      className="border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center cursor-pointer bg-muted relative overflow-hidden"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />

                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="h-full w-full object-contain"
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
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Name<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant="outline"
              type="submit"
              className="custom-form-button"
            >
              Save Category
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
