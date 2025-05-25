"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Info,
  Loader2,
  X,
  RotateCw,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComboBox from "./combo-box";
import { toast } from "sonner";
import { userSchema } from "@/schemas/schemas";
import { userDefaults } from "@/schemas/defaults";
import {
  accountPATCH,
  accountPOST,
  accountsGET,
  accountDELETE,
} from "@/lib/utils";
import { useGlobalContext } from "@/contexts/global-context";

const userRoles = [
  { value: "Admin", label: "Admin" },
  { value: "Treasurer", label: "Treasurer" },
  { value: "Auditor", label: "Auditor" },
  { value: "Secretary", label: "Secretary" },
];

import bcrypt from "bcryptjs";

export default function AccountForm() {
  const [activeTab, setActiveTab] = useState("add");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const { selectedUser, users, setSelectedUser, setUsers, user } =
    useGlobalContext();

  const defaults = userDefaults;

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: accountsGET,
  });

  useEffect(() => {
    if (!isFetching && data?.status === 200) {
      setUsers(
        data?.data.filter((account) => account.account_soft_deleted === false)
      );
    } else if (!isFetching && isError) {
      toast.error("Failed to fetch users. Please try again later.");
    }
  }, [isFetching]);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (activeTab === "add") {
      form.reset(defaults);
      setPhotoPreview(null);
    } else if (activeTab === "edit") {
      if (selectedUser) {
        form.reset({
          name: selectedUser.account_name,
          email: selectedUser.account_email,
          role: selectedUser.account_role,
          file: selectedUser?.account_profile_url,
        });
        setPhotoPreview(selectedUser.account_profile_url);
      } else {
        form.reset(defaults);
        setPhotoPreview(null);
      }
    }
  }, [activeTab, selectedUser, form]);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (userData) => {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      if (activeTab === "edit" && selectedUser) {
        return accountPATCH({
          ...userData,
        });
      } else {
        return accountPOST({
          ...userData,
          salt: salt,
        });
      }
    },
    onSuccess: (data) => {
      if (data.status !== 200) {
        toast.error(`An error occured, please try again later.`);
        return;
      }
      toast.success(
        activeTab === "edit"
          ? "User updated successfully!"
          : "User created successfully!"
      );
      if (activeTab === "add") {
        form.reset(defaults);
        setPhotoPreview(null);
      }
      refetch();
    },
    onError: (error) => {
      toast.error(
        `Error ${activeTab === "edit" ? "updating" : "creating"} user: ${
          error.message
        }`
      );
    },
  });

  // Delete user mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteUser", selectedUser?.account_id],
    mutationFn: () => accountDELETE(selectedUser?.account_id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      form.reset(defaults);
      setPhotoPreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
  });

  // Handle dialog open state change
  const handleDeleteDialogChange = (newOpen) => {
    if (isDeleting) return; // Prevent closing during deletion
    setDeleteDialogOpen(newOpen);
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("file", file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhotoPreview(null);
    form.setValue("file", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values) {
    if (activeTab === "edit" && !selectedUser) {
      toast.error("Please select a user to edit");
      return;
    }

    await mutateAsync({ ...values, account_id: selectedUser?.account_id });
  }

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "add") {
      setSelectedUser(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    setSelectedUser(null);
    form.reset(defaults);
    setPhotoPreview(null);
  };

  useEffect(() => {
    console.log("Selected User:", selectedUser);
    console.log(user);
  }, [selectedUser]);

  return (
    <>
      <Form {...form}>
        <Card className="w-full mx-auto overflow-hidden pt-0 px-2 py-6">
          <CardHeader>
            <CardTitle>User Account Management</CardTitle>
            <CardDescription>
              Create or modify user accounts in the Honesty Store IMS system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="add"
              className="w-full"
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add User</TabsTrigger>
                <TabsTrigger value="edit">Edit User</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="pt-4">
                <h2 className="form-title mb-4">Add New User</h2>
                <AccountFormContent
                  activeTab={activeTab}
                  form={form}
                  photoPreview={photoPreview}
                  fileInputRef={fileInputRef}
                  handlePhotoClick={handlePhotoClick}
                  handlePhotoChange={handlePhotoChange}
                  removePhoto={removePhoto}
                  onSubmit={onSubmit}
                  isPending={isPending}
                  setPhotoPreview={setPhotoPreview}
                  setSelectedUser={setSelectedUser}
                />
              </TabsContent>

              <TabsContent value="edit" className="pt-4">
                <h2 className="form-title mb-4">Edit User</h2>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <FormLabel className="block mb-2">
                      Select User to Edit
                    </FormLabel>
                    <div className="flex w-fit gap-2">
                      <ComboBox
                        datatype="User"
                        data={users ?? []}
                        value={selectedUser?.account_id}
                        disabled={isPending || isFetching}
                        id_attr="account_id"
                        name_attr="account_name"
                        onChange={(userId) => {
                          const user = users.find(
                            (u) => u.account_id === userId
                          );
                          setSelectedUser(user);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isPending}
                      >
                        <RotateCw
                          className={isFetching ? "animate-spin" : ""}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Delete User Button */}
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={handleDeleteDialogChange}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={
                          !selectedUser ||
                          isPending ||
                          isDeleting ||
                          user?.account_id === selectedUser?.account_id
                        }
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete user{" "}
                          <strong>{selectedUser?.account_name}</strong>? This
                          action cannot be undone and will permanently remove
                          the user account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            deleteUser();
                          }}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {selectedUser ? (
                  <AccountFormContent
                    activeTab={activeTab}
                    form={form}
                    photoPreview={photoPreview}
                    fileInputRef={fileInputRef}
                    handlePhotoClick={handlePhotoClick}
                    handlePhotoChange={handlePhotoChange}
                    removePhoto={removePhoto}
                    onSubmit={onSubmit}
                    isPending={isPending}
                    setPhotoPreview={setPhotoPreview}
                    setSelectedUser={setSelectedUser}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a user to edit
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Form>
    </>
  );
}

function AccountFormContent({
  activeTab,
  form,
  photoPreview,
  fileInputRef,
  handlePhotoClick,
  handlePhotoChange,
  removePhoto,
  onSubmit,
  isPending,
  setPhotoPreview,
  setSelectedUser,
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Profile Photo{" "}
              <span className="text-red-500 text-lg mr-auto">*</span>
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-4">
                <div
                  onClick={handlePhotoClick}
                  className={`relative h-24 w-24 overflow-hidden rounded-full border bg-muted ${
                    isPending ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isPending}
                  />

                  {photoPreview ? (
                    <>
                      <Image
                        src={photoPreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Upload className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handlePhotoClick}
                    disabled={isPending}
                  >
                    <Upload className="h-4 w-4" />
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 1MB.
                  </p>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Username */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Username <span className="text-red-500 text-lg mr-auto">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter username"
                {...field}
                disabled={isPending}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-red-500 text-lg mr-auto">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter email"
                type="email"
                {...field}
                disabled={isPending}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role Selection */}
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>
              Role <span className="text-red-500 text-lg mr-auto">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4"
                disabled={isPending}
                value={field.value}
              >
                {userRoles.map((role) => (
                  <FormItem
                    key={role.value}
                    className="flex items-center space-x-2"
                  >
                    <FormControl>
                      <RadioGroupItem
                        value={role.value}
                        id={`role-${role.value}`}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor={`role-${role.value}`}
                      className="font-normal"
                    >
                      {role.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Admin Warning */}
      {form.watch("role") === "admin" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Admin accounts have full access to all system features. Create admin
            accounts with caution.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (activeTab === "edit") {
              setSelectedUser(null);
              form.reset();
              setPhotoPreview(null);
            } else {
              form.reset();
              setPhotoPreview(null);
            }
          }}
          disabled={isPending}
        >
          {activeTab === "edit" ? "Cancel" : "Reset"}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="custom-form-button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending
            ? activeTab === "edit"
              ? "Saving..."
              : "Creating..."
            : activeTab === "edit"
            ? "Save Changes"
            : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
