"use client";
import icons from "@/constants/icons";
import { Loader2, LogOut, Bell, X } from "lucide-react";
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
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect, Fragment, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Logout, notificationPATCH, notificationSEEN } from "@/lib/utils";
import Link from "next/link";
import { AvatarImage } from "@radix-ui/react-avatar";
import Cookies from "js-cookie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { NotificationsContent } from "./notification-content";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGlobalContext } from "@/contexts/global-context";

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
  const { user, setUser } = useGlobalContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Notifications infinite query
  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = "" }) => notificationPATCH(pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.lastVisible || undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: true,
  });

  useEffect(() => {
    if (notificationsQuery.isSuccess) {
      const notifications = notificationsQuery.data.pages.flatMap(
        (page) => page.data
      );
      const userNotifs = notifications.filter((notification) => {
        return Object.entries(notification?.notification_read_status).some(
          ([key, value]) => {
            return key === user?.account_id;
          }
        );
      });

      setUserNotifications(userNotifs);
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    if (userNotifications.length > 0) {
      const unread = userNotifications.filter(
        (notification) =>
          notification?.notification_read_status[user?.account_id] === false
      );
      setUnreadCount(unread.length);
    } else {
      setUnreadCount(0);
    }
  }, [userNotifications]);

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

  const { mutateAsync: seenNotification, isPending: notificationPending } =
    useMutation({
      mutationFn: (id) => notificationSEEN(id),
      onError: (error) => {
        toast.error("Failed to mark notification as read");
      },
    });

  function getUserFromCookies() {
    const rawUser = Cookies.get("user");
    if (!rawUser) return null;

    try {
      const parsedUser = JSON.parse(decodeURIComponent(rawUser));
      let { account_profile_url } = parsedUser;

      account_profile_url = account_profile_url.replace(
        /\/o\/profile\//,
        "/o/profile%2F"
      );

      return {
        account_name: parsedUser.account_name,
        account_id: parsedUser.account_id,
        account_role: parsedUser.account_role,
        account_profile_url,
      };
    } catch (error) {
      console.error("Failed to parse user cookie:", error);
      return null;
    }
  }

  useEffect(() => {
    const userFromCookies = getUserFromCookies();
    if (!userFromCookies) return;
    setUser(userFromCookies);
  }, []);

  function handleLogout() {
    mutateAsync().then(() => setIsDialogOpen(false));
  }

  function openLogoutDialog() {
    setIsDialogOpen(true);
  }

  function markAsRead(id) {
    setUserNotifications((prev) =>
      prev.map((notification) => {
        if (notification.notification_id === id) {
          return {
            ...notification,
            notification_read_status: {
              ...notification.notification_read_status,
              [user.account_id]: true,
            },
          };
        }
        return notification;
      })
    );
    seenNotification(id).catch(() => {
      setUserNotifications((prev) => {
        return prev.map((notification) => {
          if (notification.notification_id === id) {
            return {
              ...notification,
              notification_read_status: {
                ...notification.notification_read_status,
                [user.account_id]: false,
              },
            };
          }
          return notification;
        });
      });
    });
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
                  <Fragment key={item.title}>
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
                  </Fragment>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>

      {/* Logout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? All unsaved changes will be
              lost.
            </DialogDescription>
          </DialogHeader>
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

      {/* Notifications Dialog for Mobile */}
      <Dialog
        open={isMobile && notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <NotificationsContent
            infiniteQuery={notificationsQuery}
            markAsRead={markAsRead}
            //markAllAsRead={markAllAsRead}
            unreadCount={unreadCount}
            userNotifications={userNotifications}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotificationDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SidebarFooter className="mt-auto border-t">
        {(open || openMobile) && (
          <div className="p-4 space-y-4">
            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage
                  src={user?.account_profile_url}
                  alt="user_image"
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="text-primary font-medium bg-mainButtonColor">
                  <Loader2 className="animate-spin" stroke="white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">
                  {user ? user?.account_name : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {user ? user?.account_role : ""}
                </p>
              </div>
            </div>

            {/* Notifications Button for Expanded View */}
            {isMobile ? (
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer transition-colors"
                onClick={() => setNotificationDialogOpen(true)}
                disabled={notificationsQuery.isPending}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-mainButtonColor">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ) : (
              <Popover
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer transition-colors"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {unreadCount > 0 ? (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0" align="start">
                  <NotificationsContent
                    infiniteQuery={notificationsQuery}
                    markAsRead={markAsRead}
                    //markAllAsRead={markAllAsRead}
                    userNotifications={userNotifications}
                    unreadCount={unreadCount}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
              onClick={openLogoutDialog}
              disabled={isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>

            <div className="pt-2 border-t">
              <p className="text-xs text-center text-muted-foreground">
                &copy; 2025 Honesty Store IMS
              </p>
            </div>
          </div>
        )}
        {!open && !openMobile && (
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            {/* Compact Avatar */}
            <Avatar className="h-8 w-8 border-2 border-primary/10">
              <AvatarImage
                src={user?.account_profile_url}
                alt="user_image"
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                <Loader2 className="animate-spin" />
              </AvatarFallback>
            </Avatar>

            {/* Compact Notifications Button */}
            {isMobile ? (
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setNotificationDialogOpen(true)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ) : (
              <Popover
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <NotificationsContent
                    infiniteQuery={notificationsQuery}
                    markAsRead={markAsRead}
                    //markAllAsRead={markAllAsRead}
                    userNotifications={userNotifications}
                    unreadCount={unreadCount}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Compact Logout Button */}
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
              onClick={openLogoutDialog}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
