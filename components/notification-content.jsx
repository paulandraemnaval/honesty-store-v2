"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  firebaseTimestampToLongDate,
  notificationProductsGET,
} from "@/lib/utils";
import { Loader2, Info } from "lucide-react";
import { useGlobalContext } from "@/contexts/global-context";
import {
  DialogHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "./ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";

function getRelativeTimeLabel(date) {
  const now = new Date();
  const notifDate = new Date(date);
  const diffDays = Math.floor((now - notifDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return "This Week";
  if (diffDays > 7 && diffDays <= 30) return "Last Month";
  if (diffDays > 30 && diffDays <= 60) return "Last 2 Months";
  return null; // Don't show older notifications
}

// Group notifications by time interval
function groupNotificationsByTime(notifications) {
  const groups = {};

  notifications?.forEach((notification) => {
    const timeLabel = getRelativeTimeLabel(
      firebaseTimestampToLongDate(notification?.notification_timestamp)
    );
    if (timeLabel) {
      if (!groups[timeLabel]) {
        groups[timeLabel] = [];
      }
      groups[timeLabel].push(notification);
    }
  });

  // Define the order of time labels
  const timeOrder = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Month",
    "Last 2 Months",
  ];

  // Sort groups by predetermined time order
  const sortedGroups = {};
  timeOrder.forEach((label) => {
    if (groups[label]) {
      sortedGroups[label] = groups[label].sort(
        (a, b) => b.timestamp - a.timestamp
      );
    }
  });

  return sortedGroups;
}

function formatTime(date) {
  const jsDate = new Date(firebaseTimestampToLongDate(date));

  return jsDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ------------ COMPONENT -------------//

export function NotificationsContent({
  infiniteQuery,
  markAsRead = () => {},
  markAllAsRead = () => {},
  unreadCount = 0,
  userNotifications = [],
}) {
  const {
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isSuccess,
  } = infiniteQuery;

  const { user } = useGlobalContext();

  const [productPopupOpen, setProductPopupOpen] = useState(false);
  const [notifID, setNotifID] = useState("");
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const {
    mutateAsync,
    data: products,
    isPending: isProductsLoading,
  } = useMutation({
    queryKey: [`notificationProducts-${notifID}`],
    mutationFn: (notifId) => notificationProductsGET(notifId),
    onError: (error) => {
      toast.error(`Error fetching products: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const groupedNotifications = groupNotificationsByTime(userNotifications);

  const hasNotifications = Object.keys(groupedNotifications).length > 0;

  const handleNotificationClick = (id) => {
    mutateAsync(id);
    setNotifID(id);
    setProductPopupOpen(true);
    markAsRead(id);
  };

  function isNotifRead(id) {
    return userNotifications
      .find((n) => n.notification_id === id)
      ?.notification_read_status.includes(user.account_id);
  }

  return (
    // Make the parent container full width on small screens, fixed width on larger screens
    <div className="w-full lg:w-[500px] flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center justify-between w-full ">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Badge className="ml-2 mr-2 bg-mainButtonColor">
              {unreadCount}
            </Badge>
          )}
          {/* <Button
            className="bg-mainButtonColor text-white hover:bg-mainButtonColor/80 hover:text-white cursor-pointer"
            variant="ghost"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button> */}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs mr-6 custom-form-button"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Command className="w-full">
        {/* Remove max-width from CommandList */}
        <CommandList className="w-full">
          {isFetching && !isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {isSuccess && !hasNotifications && (
            <CommandEmpty>No notifications to display</CommandEmpty>
          )}
          <Dialog open={productPopupOpen} onOpenChange={setProductPopupOpen}>
            <DialogContent className="max-w-3xl w-full">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl ">Notification</DialogTitle>
                </div>
              </DialogHeader>

              <div className="py-4">
                {isProductsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : products?.data && products?.data.length > 0 ? (
                  <ScrollArea className="h-fit pr-4">
                    <div className="grid grid-cols-1 gap-4">
                      {products?.data.map((product, index) => (
                        <div
                          key={product.product_sku || index}
                          className="flex p-2 bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="relative h-ull w-[20%] flex items-center justify-center-safe bg-gray-100 flex-shrink-1">
                            {product.product_image_url ? (
                              <Image
                                src={product.product_image_url}
                                alt={product.product_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Info className="h-10 w-10 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1 truncate">
                            <h3 className="font-medium text-lg line-clamp-2">
                              {product.product_name}
                            </h3>
                            <div className="mt-2 flex items-center">
                              <Badge variant="outline" className="text-xs">
                                SKU: {product.product_sku}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Info className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      No products found for this notification
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setProductPopupOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
            <ScrollArea className="h-fit w-full">
              {Object.entries(groupedNotifications).map(
                ([timeLabel, items]) => (
                  <div key={timeLabel} className="w-full">
                    <CommandGroup heading={timeLabel} className="w-full">
                      {items.map((notification) => (
                        <CommandItem
                          key={notification?.notification_id}
                          onSelect={() =>
                            handleNotificationClick(
                              notification?.notification_id
                            )
                          }
                          className={`cursor-pointer w-full mb-2  border ${
                            !isNotifRead(notification?.notification_id) &&
                            "border-textColor"
                          }`}
                        >
                          <div className="flex flex-col  max-w-full">
                            <div className="flex items-center justify-between max-w-[70dvw]">
                              <div className="font-medium flex items-center truncate">
                                <span className="truncate font-semibold">
                                  {notification?.notification_title}
                                </span>
                                {!isNotifRead(notification.notification_id) && (
                                  <span className="ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-400"></span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTime(
                                  notification?.notification_timestamp
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification?.notification_body}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </div>
                )
              )}

              {/* Sentinel element for infinite scrolling */}
              {hasNextPage && (
                <div
                  ref={sentinelRef}
                  className="h-10 flex items-center justify-center"
                >
                  {isFetchingNextPage && <Loader2 className="animate-spin" />}
                </div>
              )}
            </ScrollArea>
          </Dialog>
        </CommandList>
      </Command>
    </div>
  );
}
