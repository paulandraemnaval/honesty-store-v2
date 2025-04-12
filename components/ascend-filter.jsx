import React from "react";
import { Button } from "./ui/button";
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  PhilippinePeso,
} from "lucide-react";
import { HoverCard, HoverCardTrigger } from "./ui/hover-card";
import { Card, CardContent } from "./ui/card";
import { HoverCardContent } from "@radix-ui/react-hover-card";
const AscendFilter = ({ icon, ascendingFilter, setAscendingFilter }) => {
  function handleClick() {
    setAscendingFilter((prev) =>
      prev === "ascending" ? "descending" : "ascending"
    );
  }
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button onClick={handleClick} className="mr-auto" variant="outline">
          {icon}

          {ascendingFilter === "ascending" ? (
            <ArrowUpWideNarrow size={20} />
          ) : (
            <ArrowDownNarrowWide size={20} />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" sideOffset={5} className="bg-white">
        <div className="p-2 border shadow-sm rounded-md">
          {ascendingFilter === "ascending" ? "ascending" : "descending"}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AscendFilter;
