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
  onChange,
  disabled,
  name_attr,
  id_attr,
}) {
  const [open, setOpen] = React.useState(false);
  const isItemSelected = (item) => {
    return value === item[id_attr];
  };

  const safeData = Array.isArray(data) ? data : [];

  function getSelectedItem() {
    const selectedItem = safeData.find((item) => item[id_attr] === value);
    return selectedItem ? selectedItem[name_attr] : `Select ${datatype}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {getSelectedItem()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${datatype}`} />
          <CommandList>
            <CommandEmpty>No {datatype} found.</CommandEmpty>
            <CommandGroup>
              {safeData.map((item) => (
                <CommandItem
                  key={item[id_attr]}
                  value={item[id_attr]}
                  onSelect={() => {
                    onChange(item[id_attr]);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isItemSelected(item) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item[name_attr]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
