"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCw, ChevronRight, ChevronLeft } from "lucide-react";

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
import ComboBox from "./combo-box";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { toast } from "sonner";
import { supplierSchema } from "@/schemas/schemas";
import { supplierDefaults } from "@/schemas/defaults";
import { supplierGET, supplierPATCH, supplierPOST } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

export default function SupplierForm() {
  const { setSuppliers, suppliers, selectedSupplier, setSelectedSupplier } =
    useGlobalContext();
  const [activeTab, setActiveTab] = useState("add");
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const defaults = supplierDefaults;

  const { isFetching, refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierGET(),
    onSuccess: (data) => {
      console.log(data, "FROM ON SUCCESS");
      setSuppliers(data);
    },
    onError: (error) => {
      toast.error(`Error fetching suppliers: ${error.message}`);
    },
  });

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (activeTab === "add") {
      form.reset(defaults);
      setShowOptionalFields(false);
    } else if (activeTab === "edit") {
      if (selectedSupplier) {
        form.reset({
          supplier_name: selectedSupplier.supplier_name,
          supplier_contact_person: selectedSupplier.supplier_contact_person,
          supplier_contact_number: selectedSupplier.supplier_contact_number,
          supplier_email_address: selectedSupplier.supplier_email_address,
          supplier_notes: selectedSupplier.supplier_notes || "",
        });
        setShowOptionalFields(false);
      } else {
        form.reset(defaults);
      }
    }
  }, [activeTab, selectedSupplier, form]);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["supplier"],
    mutationFn: (obj) => {
      if (activeTab === "edit" && selectedSupplier) {
        return supplierPATCH({
          ...obj,
          supplier_id: selectedSupplier.supplier_id,
        });
      } else {
        return supplierPOST(obj);
      }
    },
    onSuccess: () => {
      toast.success(
        activeTab === "edit"
          ? "Supplier updated successfully!"
          : "Supplier created successfully!"
      );
      if (activeTab === "add") {
        form.reset(defaults);
        setShowOptionalFields(false);
      }
    },
    onError: (error) => {
      toast.error(
        `Error ${activeTab === "edit" ? "updating" : "creating"} supplier: ${
          error.message
        }`
      );
    },
  });

  function onSubmit(values) {
    if (activeTab === "edit" && !selectedSupplier) {
      toast.error("Please select a supplier to edit");
      return;
    }

    console.log(values);
    mutateAsync(values);
  }

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "add") {
      setSelectedSupplier(null);
    }
    setShowOptionalFields(false);
  };

  const handleRefresh = () => {
    refetch();
    setSelectedSupplier(null);
    form.reset(defaults);
    setShowOptionalFields(false);
  };

  return (
    <Form {...form}>
      <Card className="w-full mx-auto overflow-auto pt-0">
        <CardContent className="pt-6">
          <Tabs
            defaultValue="add"
            className="w-full"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Supplier</TabsTrigger>
              <TabsTrigger value="edit">Edit Supplier</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="pt-4">
              <h2 className="form-title mb-4">Add New Supplier</h2>
              <SupplierFormContent
                form={form}
                onSubmit={onSubmit}
                isPending={isPending}
                showOptionalFields={showOptionalFields}
                setShowOptionalFields={setShowOptionalFields}
              />
            </TabsContent>

            <TabsContent value="edit" className="pt-4">
              <h2 className="form-title mb-4">Edit Supplier</h2>
              <FormLabel className="block mb-2">
                Select Supplier to Edit
              </FormLabel>

              <div className="mb-6 flex w-full gap-2">
                <ComboBox
                  datatype="Supplier"
                  data={suppliers ?? []}
                  value={selectedSupplier}
                  setSelectedValue={handleSupplierSelect}
                  disabled={isPending}
                />
                <Button
                  variant={"outline"}
                  size={"icon"}
                  onClick={handleRefresh}
                >
                  <RotateCw className={isFetching ? "animate-spin" : ""} />
                </Button>
              </div>
              {selectedSupplier ? (
                <SupplierFormContent
                  form={form}
                  onSubmit={onSubmit}
                  isPending={isPending}
                  showOptionalFields={showOptionalFields}
                  setShowOptionalFields={setShowOptionalFields}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a supplier to edit
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Form>
  );
}

function SupplierFormContent({
  form,
  onSubmit,
  isPending,
  showOptionalFields,
  setShowOptionalFields,
}) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Validation errors", errors);
      })}
      className="space-y-6"
    >
      <ScrollArea className="form-scroll-area">
        {/* Required Fields Section */}
        <div className={`space-y-4 ${showOptionalFields ? "hidden" : "block"}`}>
          <FormField
            control={form.control}
            name="supplier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter supplier name"
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
            name="supplier_contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact person"
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
            name="supplier_contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact number (09XXXXXXXXX)"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Fields Section */}
        <div className={`space-y-4 ${showOptionalFields ? "block" : "hidden"}`}>
          <FormField
            control={form.control}
            name="supplier_email_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter email"
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
            name="supplier_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter supplier notes"
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

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="custom-form-button"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isPending ? "Saving..." : "Save Supplier"}
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
  );
}
