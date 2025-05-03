"use client";

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

// Helper function to format relative time
function getRelativeTimeLabel(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

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

  notifications.forEach((notification) => {
    const timeLabel = getRelativeTimeLabel(notification.timestamp);
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

// Format time for display
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function NotificationsContent({
  notifications,
  markAsRead,
  markAllAsRead,
}) {
  const groupedNotifications = groupNotificationsByTime(notifications);
  const hasNotifications = Object.keys(groupedNotifications).length > 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle notification click
  const handleNotificationClick = (id) => {
    markAsRead(id);
    // Additional actions like navigation could be added here
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
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

      <Command>
        <CommandList>
          {!hasNotifications && (
            <CommandEmpty>No notifications to display</CommandEmpty>
          )}

          <ScrollArea className="h-[300px]">
            {Object.entries(groupedNotifications).map(([timeLabel, items]) => (
              <CommandGroup heading={timeLabel} key={timeLabel}>
                {items.map((notification) => (
                  <CommandItem
                    key={notification.id}
                    onSelect={() => handleNotificationClick(notification.id)}
                    className={`cursor-pointer ${
                      !notification.read ? "bg-muted/60" : ""
                    }`}
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </ScrollArea>
        </CommandList>
      </Command>
    </div>
  );
}
