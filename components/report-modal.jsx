"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Loader2 } from "lucide-react";
import { reportPOST } from "@/lib/utils";
import { reportFormSchema } from "@/schemas/schemas";

export default function ReportDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      cash_inflow: "",
      cash_outflow: "",
    },
  });

  const { data, isPending, mutateAsync } = useMutation({
    mutationFn: (values) => reportPOST(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });

      toast.success("Report created successfully");
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Form submission handler
  const onSubmit = (values) => {
    mutateAsync(values);
  };

  // Handler for decimal number input
  const handleDecimalInput = (e, field) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,2}$/; // Allow numbers with up to 2 decimal places

    if (regex.test(value) || value === "") {
      field.onChange(value);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="custom-form-button">
          Create Report
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Create Financial Report</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the financial details for this reporting period.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="cash_inflow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash Inflow</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cash inflow"
                      {...field}
                      onChange={(e) => handleDecimalInput(e, field)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total amount of cash received during this period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cash_outflow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash Outflow</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cash outflow"
                      {...field}
                      onChange={(e) => handleDecimalInput(e, field)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total amount of cash spent during this period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="custom-form-button"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
