"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ComboBox({
  data,
  datatype,
  value,
  setSelectedValue,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = React.useMemo(() => {
    if (!value) return "";
    if (datatype === "Product Category" || datatype === "Category") {
      return value.category_name;
    }
    if (datatype === "Supplier") {
      return value.supplier_name;
    }
    return "";
  }, [value, datatype]);

  function getPlaceholder() {
    if (datatype === "Product Category" || datatype === "Category") {
      return "Search Category";
    }
    if (datatype === "Supplier") {
      return "Search Supplier";
    }
    return `Search ${datatype}`;
  }

  function getCommandValue(item) {
    if (datatype === "Product Category" || datatype === "Category") {
      return item.category_name;
    }
    if (datatype === "Supplier") {
      return item.supplier_name;
    }
    return item;
  }

  function getItemLabel(item) {
    if (datatype === "Product Category" || datatype === "Category") {
      return item.category_name;
    }
    if (datatype === "Supplier") {
      return item.supplier_name;
    }
    return item;
  }

  function isItemSelected(item) {
    if (!value) return false;

    if (datatype === "Product Category" || datatype === "Category") {
      return value.category_id === item.category_id;
    }
    if (datatype === "Supplier") {
      return value.supplier_id === item.supplier_id;
    }
    return false;
  }

  const safeData = Array.isArray(data) ? data : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between"
          disabled={disabled}
        >
          {selectedLabel || `Select ${datatype}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex-1 p-0" align="start">
        <Command>
          <CommandInput placeholder={getPlaceholder()} />
          <CommandList className="w-full">
            <CommandEmpty>No {datatype} found.</CommandEmpty>
            <CommandGroup>
              {safeData.map((item, index) => (
                <CommandItem
                  key={index}
                  value={getCommandValue(item)}
                  onSelect={() => {
                    setSelectedValue(item);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isItemSelected(item) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getItemLabel(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
