"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, EyeClosed, Loader2, Router } from "lucide-react";
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
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Login } from "@/lib/utils";
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string(),
});

function AuthForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { setUser } = useGlobalContext();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (values) => Login(values),
    onSuccess: ({ status, user }) => {
      console.log(status, user);
      if (status === 200) {
        toast.success("Successfully logged in");
        setUser(user);
        router.push("/admin/user/");
      } else {
        toast.error("Invalid email or password");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while logging in");
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(values) {
    mutateAsync(values);
  }

  function handlePeekPress() {
    setShowPassword((prev) => !prev);
  }

  return (
    <Card className="w-[450px] border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex w-full items-center justify-center flex-col">
          <span className="text-2xl">Welcome Back</span>
          <span className="text-sm font-thin text-slate-400">
            Sign in to your account
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} method="PATCH">
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="name">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex w-full">
                      <FormLabel htmlFor="name">Password</FormLabel>
                      <span className="ml-auto underline font-thin text-slate-400 text-sm mt-2">
                        Forgot Password?
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            id="name"
                            type={`${showPassword ? "text" : "password"}`}
                            placeholder="****"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          className="bg-transparent border shadow-2xs rounded-md"
                          onClick={handlePeekPress}
                          variant="outline"
                          size="icon"
                          type="button"
                        >
                          {showPassword ? <EyeClosed /> : <Eye />}
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button
              className="bg-[#4285F4] w-full hover:bg-[#4285F4] cursor-pointer mt-4"
              disabled={isPending}
              type="submit"
            >
              {isPending ? <Loader2 /> : null} Sign-in
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default AuthForm;
