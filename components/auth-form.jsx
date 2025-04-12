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
import { Eye } from "lucide-react";
const AuthForm = () => {
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
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Email</Label>
              <Input id="name" placeholder="example@gmail.com" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Password</Label>
              <div className="flex flex-col">
                <div className="flex gap-2">
                  <Input id="name" type="password" placeholder="****" />
                  <Button className="bg-transparent border shadow-2xs rounded-md">
                    <Eye className="h-4 w-4" fill="black" />
                  </Button>
                </div>
                <span className="ml-auto underline font-thin text-slate-400 text-sm">
                  Forgot Password?
                </span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="bg-[#4285F4] w-full hover:bg-[#4285F4] cursor-pointer">
          Sign-in
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
