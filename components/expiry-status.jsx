import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getExpiryStatus } from "@/lib/utils";
import { Check, CheckCircle, TriangleAlert, X } from "lucide-react";
const ExpiryStatus = ({ expiryDate }) => {
  const { status, color, bgcolor } = getExpiryStatus(expiryDate);
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={`${bgcolor} p-2 rounded-md flex items-center justify-center `}
        >
          {color.includes("green") ? (
            <CheckCircle size={20} stroke={`${color}`} />
          ) : (
            <TriangleAlert size={20} stroke={`${color}`} />
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="top" sideOffset={5} className="w-fit p-2">
        <div className={`p-2 rounded-md text-xs `}>
          <div className="flex items-center space-x-2">{status}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ExpiryStatus;
