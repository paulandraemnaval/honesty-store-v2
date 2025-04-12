"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Table, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

const customClassNames = {
  months: "flex flex-col sm:flex-row space-x-2",
  month: "space-y-2",
  caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-xs font-medium",
  nav: "space-x-1 flex items-center",
  nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse space-y-1 ",
  head_row: "flex",
  head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]",
  row: "flex w-full mt-1",
  cell: cn(
    "relative p-0 text-center  text-xs focus-within:relative focus-within:z-20",
    "[&:has([aria-selected])]:bg-[#e0f2fe]",
    "[&:has([aria-selected].day-range-end)]:rounded-r-md",
    "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md",
    "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
  ),
  day: cn("h-7 w-7 p-0 font-normal text-xs aria-selected:opacity-100"),
  day_range_start:
    "day-range-start aria-selected:bg-mainButtonColor aria-selected:text-white rounded-md",
  day_range_end:
    "day-range-end aria-selected:bg-mainButtonColor aria-selected:text-white rounded-md",
  day_selected:
    "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9] hover:text-white focus:bg-[#0ea5e9] focus:text-white",
  day_today: "bg-accent text-accent-foreground",
  day_outside: "text-muted-foreground opacity-50",
  day_disabled: "text-muted-foreground opacity-50",
  day_range_middle: "aria-selected:bg-[#e0f2fe] aria-selected:text-[#0c4a6e]",
  day_hidden: "invisible",
};

const InventoryReport = () => {
  const [date, setDate] = React.useState({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="px-4 py-2 bg-mainButtonColor backdrop-blur-sm border transition-colors text-white cursor-pointer"
          onClick={() => {
            console.log("clicked");
          }}
        >
          <Plus /> <Table />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit p-4 bg-white shadow-md rounded-md"
        side="bottom"
      >
        <div className={cn("grid gap-2")}>
          <div className="text-sm">
            Create an inventory report for a date range.
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              side="bottom"
              align="end"
              alignOffset={-17}
              sideOffset={65}
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                classNames={customClassNames}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2 bg-mainButtonColor text-white cursor-pointer"
        >
          Generate Inventory Report
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default InventoryReport;
