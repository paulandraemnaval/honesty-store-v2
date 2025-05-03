import React from "react";
import { Button } from "./ui/button";
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  AlignJustify,
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
    <Button onClick={handleClick} variant="outline">
      {icon}
      {ascendingFilter === "none" ? (
        <AlignJustify size={20} />
      ) : ascendingFilter ? (
        <ArrowUpWideNarrow size={20} />
      ) : (
        <ArrowDownNarrowWide size={20} />
      )}{" "}
    </Button>
  );
};

export default AscendFilter;
