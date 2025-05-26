"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ComboBox from "./combo-box";
import { categorySchema } from "@/schemas/schemas";
import { categoryDefaults } from "@/schemas/defaults";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryDELETE, categoryPATCH, categoryPOST } from "@/lib/utils";
import { useGlobalContext } from "@/contexts/global-context";
import Image from "next/image";
import { toast } from "sonner";
import { categoriesGET } from "@/lib/utils";
import DeleteButton from "./delete-button";

export default function CategoryForm() {
  const queryClient = useQueryClient();
  const { selectedCategory, categories, setSelectedCategory, setCategories } =
    useGlobalContext();
  const [activeTab, setActiveTab] = useState("add");
  const [imagePreview, setImagePreview] = useState();
  const fileInputRef = useRef(null);

  const defaults = categoryDefaults;

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesGET,
  });

  useEffect(() => {
    if (data?.status === 200) {
      setCategories(data?.data);
    } else {
      toast.error("Error fetching categories");
    }
  }, [isFetching]);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (activeTab === "add") {
      form.reset(defaults);
      setImagePreview(null);
    } else if (activeTab === "edit") {
      if (selectedCategory) {
        form.reset({
          category_name: selectedCategory.category_name,
          category_description: selectedCategory.category_description,
          file: selectedCategory.category_image_url,
        });
        setImagePreview(selectedCategory.category_image_url);
      } else {
        form.reset(defaults);
        setImagePreview(null);
      }
    }
  }, [activeTab, selectedCategory, form]);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["category"],
    mutationFn: (obj) => {
      if (activeTab === "edit" && selectedCategory) {
        return categoryPATCH({
          ...obj,
          category_id: selectedCategory.category_id,
        });
      } else {
        return categoryPOST(obj);
      }
    },
    onSuccess: (data) => {
      if (data.status !== 200) {
        toast.error(
          `Error ${activeTab === "edit" ? "updating" : "creating"} category: ${
            data.message
          }`
        );
        return;
      }
      refetch();
      toast.success(
        activeTab === "edit"
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      if (activeTab === "add") {
        form.reset(defaults);
        setImagePreview(null);
      }
    },
    onError: (error) => {
      toast.error(
        `Error ${activeTab === "edit" ? "updating" : "creating"} category: ${
          error.message
        }`
      );
    },
  });

  const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-category"],
    mutationFn: () => categoryDELETE(selectedCategory.category_id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error deleting category: ${error.message}`);
    },
  });

  function handleDelete() {
    deleteCategory().then(() => {
      setSelectedCategory(null);
      form.reset(defaults);
      setImagePreview(null);
    });
  }

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

  async function onSubmit(values) {
    if (activeTab === "edit" && !selectedCategory) {
      toast.error("Please select a category to edit");
      return;
    }

    await mutateAsync(values);
  }

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "add") {
      setSelectedCategory(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    setSelectedCategory(null);
    form.reset(defaults);
    setImagePreview(null);
  };

  return (
    <Form {...form}>
      <Card className="w-full  mx-auto overflow-hidden pt-0 ">
        <CardContent className="pt-6 h-full">
          <Tabs
            defaultValue="add"
            className="w-full"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Category</TabsTrigger>
              <TabsTrigger value="edit">Edit Category</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="pt-4 ">
              <h2 className="form-title mb-4">Add New Category</h2>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log("Validation errors", errors);
                })}
                className="space-y-6 "
              >
                <ScrollArea className="form-scroll-area">
                  <div className="space-y-6 pr-4">
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Category Image{" "}
                            <span className="text-red-500 text-lg">*</span>
                          </FormLabel>
                          <FormControl>
                            <div
                              onClick={handleImageClick}
                              className={`border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center ${
                                isPending
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
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
                                    alt="Category preview"
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
                                    Click to upload category image
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
                            Category Name{" "}
                            <span className="text-red-500 text-lg">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter category name"
                              {...field}
                              disabled={isPending}
                            />
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="custom-form-button"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {isPending ? "Saving..." : "Save Category"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent
              value="edit"
              className="pt-4 w-full h-full overflow-auto "
            >
              <h2 className="form-title mb-2 justify-between flex items-center">
                Edit Category
                {selectedCategory && (
                  <DeleteButton
                    deleteFn={handleDelete}
                    isLoading={isDeleting}
                    entityName="category"
                  />
                )}
              </h2>

              <FormLabel className="block mb-2">
                Select Category to Edit
              </FormLabel>

              <div className="mb-6 flex gap-2 w-[80%] py-0">
                <ComboBox
                  datatype="Category"
                  data={categories ?? []}
                  value={selectedCategory?.category_id}
                  disabled={isPending || isFetching}
                  id_attr="category_id"
                  name_attr="category_name"
                  onChange={(categoryId) => {
                    const category = categories.find(
                      (c) => c.category_id === categoryId
                    );
                    setSelectedCategory(category);
                  }}
                />
                <Button variant="outline" size="icon" onClick={handleRefresh}>
                  <RotateCw className={isFetching ? "animate-spin" : ""} />
                </Button>
              </div>
              {selectedCategory ? (
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.log("Validation errors", errors);
                  })}
                  className="space-y-6 flex flex-col h-full"
                >
                  <ScrollArea className="form-scroll-area h-70">
                    <div className="space-y-6 pr-4">
                      <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Category Image
                              <span className="text-red-500 text-lg">*</span>
                            </FormLabel>
                            <FormControl>
                              <div
                                onClick={handleImageClick}
                                className={`border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center ${
                                  isPending
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer"
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
                                      alt="Category preview"
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
                                      Click to upload category image
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
                              Category Name{" "}
                              <span className="text-red-500 text-lg">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter category name"
                                {...field}
                                disabled={isPending}
                              />
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

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="custom-form-button w-fit"
                  >
                    {isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {isPending ? "Saving..." : "Save Category"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a category to edit
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Form>
  );
}
