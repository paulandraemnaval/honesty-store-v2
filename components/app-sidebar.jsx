"use client";
import icons from "@/constants/icons";
import { LogOut } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import React from "react";

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
  const { open, openMobile } = useSidebar();
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
                        <a href={item.url}>
                          <Image
                            src={item.icon}
                            alt={item.title}
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                          <span>{item.title}</span>
                        </a>
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
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
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

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>

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
            >
              <LogOut className=" h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
