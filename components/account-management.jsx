"use client";

import React from "react";

import { useState } from "react";
import { format } from "date-fns";
import {
  UserPlus,
  UserCog,
  Upload,
  Calendar,
  Shield,
  Info,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

// Sample users for the edit account tab
const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@honesty.store",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@honesty.store",
    role: "treasurer",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@honesty.store",
    role: "auditor",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@honesty.store",
    role: "secretary",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [tempAdminEnabled, setTempAdminEnabled] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle photo upload
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle the form submission here
    setSuccessMessage("Account created successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle the form submission here
    setSuccessMessage("Account updated successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="container mx-auto px-6 py-4">
      {successMessage && (
        <Alert className="mb-6 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="create"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create New Account
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Edit Existing Account
          </TabsTrigger>
        </TabsList>

        {/* Create Account Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
              <CardDescription>
                Add a new user to the Honesty Store IMS system. All fields are
                required.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSubmit}>
              <CardContent className="space-y-6 mb-2">
                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
                      {photoPreview ? (
                        <Image
                          src={photoPreview || "/placeholder.svg"}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          No photo
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() =>
                          document.getElementById("photo-upload")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Button>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        JPG, PNG or GIF. Max 1MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" required />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup
                    defaultValue="auditor"
                    className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="font-normal">
                        Admin
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="treasurer" id="treasurer" />
                      <Label htmlFor="treasurer" className="font-normal">
                        Treasurer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="auditor" id="auditor" />
                      <Label htmlFor="auditor" className="font-normal">
                        Auditor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="secretary" id="secretary" />
                      <Label htmlFor="secretary" className="font-normal">
                        Secretary
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Admin accounts have full access to all system features.
                    Create admin accounts with caution.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhotoPreview(null);
                    document.querySelectorAll("input").forEach((input) => {
                      if (input.type !== "radio") input.value = "";
                    });
                  }}
                >
                  Reset
                </Button>
                <Button type="submit">Create Account</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Edit Account Tab */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Existing Account</CardTitle>
              <CardDescription>
                Modify user details or update permissions for existing accounts.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEditSubmit}>
              <CardContent className="space-y-6">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label htmlFor="user-select">Select User</Label>
                  <Select
                    onValueChange={(value) => setSelectedUser(Number(value))}
                    value={selectedUser?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to edit" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.name} ({user.role})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && (
                  <>
                    {/* Profile Photo */}
                    <div className="space-y-2">
                      <Label htmlFor="photo">Profile Photo</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted">
                          <Image
                            src={
                              photoPreview ||
                              sampleUsers.find((u) => u.id === selectedUser)
                                ?.avatar ||
                              "/placeholder.svg?height=96&width=96"
                            }
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              document
                                .getElementById("photo-upload-edit")
                                ?.click()
                            }
                          >
                            <Upload className="h-4 w-4" />
                            Change Photo
                          </Button>
                          <Input
                            id="photo-upload-edit"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                          <p className="mt-2 text-xs text-muted-foreground">
                            JPG, PNG or GIF. Max 1MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="username-edit">Username</Label>
                        <Input
                          id="username-edit"
                          defaultValue={
                            sampleUsers.find((u) => u.id === selectedUser)?.name
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-edit">Email</Label>
                        <Input
                          id="email-edit"
                          type="email"
                          defaultValue={
                            sampleUsers.find((u) => u.id === selectedUser)
                              ?.email
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Password (Optional for Edit) */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password-edit">
                          New Password (Optional)
                        </Label>
                        <Input id="password-edit" type="password" />
                        <p className="text-xs text-muted-foreground">
                          Leave blank to keep current password
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password-edit">
                          Confirm New Password
                        </Label>
                        <Input id="confirm-password-edit" type="password" />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RadioGroup
                        defaultValue={
                          sampleUsers.find((u) => u.id === selectedUser)
                            ?.role || "auditor"
                        }
                        className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="admin" id="admin-edit" />
                          <Label htmlFor="admin-edit" className="font-normal">
                            Admin
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="treasurer"
                            id="treasurer-edit"
                          />
                          <Label
                            htmlFor="treasurer-edit"
                            className="font-normal"
                          >
                            Treasurer
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auditor" id="auditor-edit" />
                          <Label htmlFor="auditor-edit" className="font-normal">
                            Auditor
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="secretary"
                            id="secretary-edit"
                          />
                          <Label
                            htmlFor="secretary-edit"
                            className="font-normal"
                          >
                            Secretary
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Temporary Admin Privileges */}
                    <div className="space-y-4 rounded-lg border p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="flex items-center gap-2 font-medium">
                            <Shield className="h-4 w-4 text-amber-500" />
                            Temporary Admin Privileges
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Grant admin access for a limited time period
                          </p>
                        </div>
                        <Switch
                          checked={tempAdminEnabled}
                          onCheckedChange={setTempAdminEnabled}
                        />
                      </div>

                      {tempAdminEnabled && (
                        <div className="space-y-2 pt-2">
                          <Label>Admin Access Period</Label>
                          <div className="grid gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="justify-start text-left font-normal"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {dateRange.from ? (
                                    dateRange.to ? (
                                      <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                      </>
                                    ) : (
                                      format(dateRange.from, "LLL dd, y")
                                    )
                                  ) : (
                                    <span>Pick a date range</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  initialFocus
                                  mode="range"
                                  defaultMonth={dateRange.from}
                                  selected={{
                                    from: dateRange.from,
                                    to: dateRange.to,
                                  }}
                                  onSelect={(range) => {
                                    setDateRange({
                                      from: range?.from,
                                      to: range?.to,
                                    });
                                  }}
                                  numberOfMonths={2}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Admin privileges will automatically expire at the
                            end of the selected period.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setPhotoPreview(null);
                    setTempAdminEnabled(false);
                    setDateRange({ from: undefined, to: undefined });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedUser}>
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
