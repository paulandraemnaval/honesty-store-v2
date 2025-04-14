"use client";
import icons from "@/constants/icons";
import { Loader2, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/global-context";
import React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Logout } from "@/lib/utils";
import Link from "next/link";

const items = [
  {
    title: "Dashboard",
    url: "/admin/user/",
    icon: icons.homeIcon,
  },
  {
    title: "Products",
    url: "/admin/user/products",
    icon: icons.productsIcon,
  },
  {
    title: "Audit",
    url: "/admin/user/audit",
    icon: icons.auditIcon,
  },
  {
    title: "Reports",
    url: "/admin/user/report",
    icon: icons.manageIcon,
  },
  {
    title: "Account Management",
    url: "/admin/user/account_management",
    icon: icons.accountsIcon,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { open, openMobile } = useSidebar();
  const { setUser, user } = useGlobalContext();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => Logout(),
    queryKey: ["logout"],
    onSuccess: ({ status }) => {
      if (status === 200) {
        toast.success("Successfully logged out");
        setUser(null);
        router.push("/admin");
      } else {
        toast.error("Failed to log out");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while logging out");
    },
  });

  function handleLogout() {
    mutateAsync();
  }
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image
            src={icons.logo}
            alt="logo"
            width={40}
            height={40}
            className="bg-[#0175fb] rounded-sm object-cover"
          />
          {(open || openMobile) && (
            <div className="flex flex-col gap-0">
              <span className="text-textColor font-inter">Honesty Store</span>
              <span className="text-sm font-thin text-slate-400">IMS</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupContent>
                {items.map((item, index) => (
                  <React.Fragment key={item.title}>
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <Image
                            src={item.icon}
                            alt={item.title}
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {(index + 1) % 2 === 0 && index !== items.length - 1 ? (
                      <Separator className="my-2" />
                    ) : null}
                  </React.Fragment>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t">
        {(open || openMobile) && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">
                  John Doe
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Administrator
                </p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                  disabled={isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </DialogTrigger>
              <DialogContent className="w-fit">
                <DialogTitle>Log out?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out? All unsaved changes will be
                  lost.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="w-fit justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    onClick={handleLogout}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {isPending ? "Logging out..." : "Log out"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="pt-2 border-t">
              <p className="text-xs text-center text-muted-foreground">
                &copy; {new Date().getFullYear()} Honesty Store IMS
              </p>
            </div>
          </div>
        )}
        {!open && !openMobile && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                JD
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="flex items-center w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4" />
              ) : (
                <LogOut className=" h-4 w-4" />
              )}
              {isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
