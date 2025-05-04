"use client";

import { useEffect, useRef } from "react";
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
import { firebaseTimestampToLongDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useGlobalContext } from "@/contexts/global-context";

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

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

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
        <div className="flex items-center">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-mainButtonColor">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
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
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}

          {isSuccess && !hasNotifications && (
            <CommandEmpty>No notifications to display</CommandEmpty>
          )}

          <ScrollArea className="h-fit w-full">
            {Object.entries(groupedNotifications).map(([timeLabel, items]) => (
              <div key={timeLabel} className="w-full">
                <CommandGroup heading={timeLabel} className="w-full">
                  {items.map((notification) => (
                    <CommandItem
                      key={notification?.notification_id}
                      onSelect={() =>
                        handleNotificationClick(notification?.notification_id)
                      }
                      className={`cursor-pointer w-full border ${
                        !isNotifRead(notification?.notification_id) &&
                        "border-textColor"
                      }`}
                    >
                      <div className="flex flex-col ">
                        <div className="flex items-center justify-between max-w-[70dvw] lg:max-w-full">
                          <div className="font-medium flex items-center truncate">
                            <span className="truncate">
                              {notification?.notification_title}
                            </span>
                            {!isNotifRead(notification.notification_id) && (
                              <span className="ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(notification?.notification_timestamp)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification?.notification_body}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}

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
        </CommandList>
      </Command>
    </div>
  );
}
