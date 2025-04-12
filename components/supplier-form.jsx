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
  supplier_name: z.string().min(2, {
    message: "Supplier name must be at least 2 characters.",
  }),
  supplier_contact_person: z.string({ message: "Contact person is required." }),
  supplier_contact_number: z.string().refine(
    (value) => {
      const phNumberRegex = /^(09\d{9}|\+639\d{9})$/;
      return phNumberRegex.test(value);
    },
    {
      message:
        "Must be a valid Philippine number (09XXXXXXXXX or +639XXXXXXXXX)",
    }
  ),
  supplier_email: z.string({ message: "Email is Required" }).email({
    message: "Invalid email address.",
  }),
  supplier_description: z.string().optional(),
});

export default function SupplierForm({ method }) {
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_name: "",
      supplier_description: "",
      supplier_contact_person: "",
      supplier_contact_number: "",
      supplier_email: "",
    },
  });

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
            <ComboBox name={"Supplier"} />
          </div>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div
              className={`space-y-6 ${showOptionalFields ? "hidden" : "block"}`}
            >
              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
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
                      <Input placeholder="Enter contact person" {...field} />
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
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* OPTIONALS */}
            <div
              className={`space-y-6 ${showOptionalFields ? "block" : "hidden"}`}
            >
              <FormField
                control={form.control}
                name="supplier_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter supplier notes"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="submit" className="custom-form-button">
                Save Product
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
