import React from "react";
import { Button } from "./ui/button";
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  PhilippinePeso,
} from "lucide-react";
import { HoverCard, HoverCardTrigger } from "./ui/hover-card";
import { HoverCardContent } from "@radix-ui/react-hover-card";
const AscendFilter = ({
  icon,
  ascendingFilter,
  setAscendingFilter,
  AscendFalseMessage,
  AscendTrueMessage,
}) => {
  function handleClick() {
    setAscendingFilter((prev) => !prev);
  }
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button onClick={handleClick} variant="outline">
          {icon}

          {ascendingFilter ? (
            <ArrowUpWideNarrow size={20} />
          ) : (
            <ArrowDownNarrowWide size={20} />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" sideOffset={5} className="bg-white">
        <div className="p-2 border shadow-sm rounded-md">
          {ascendingFilter ? AscendTrueMessage : AscendFalseMessage}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AscendFilter;
