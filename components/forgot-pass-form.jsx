"use client";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

function ForgotPasswordForm({ onClose }) {
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => forgotPassword(form.getValues("email")),
    onSuccess: ({ status }) => {
      if (status === 200) {
        toast.success("Password reset email sent successfully");
        form.reset();
        onClose();
      } else {
        toast.error("Failed to send password reset email");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while sending reset email");
    },
  });

  function onSubmit(values) {
    mutateAsync(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-slate-600">
            Enter your email to reset your password to your account
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example@gmail.com"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#4285F4] hover:bg-[#4285F4]"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : null}
            Send Reset Email
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ForgotPasswordForm;
