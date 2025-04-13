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
  defaultValue,
  setSelectedValue,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  function getValue() {
    const ret = data.find((item) => item.category_id === defaultValue);
    if (ret) {
      setValue(ret.category_name);
      setSelectedValue(ret.category_id);
    }
  }

  function getPlaceholder() {
    if (datatype === "Product Category") {
      return "Search Category";
    }
    if (datatype === "Supplier") {
      return "Search Supplier";
    }
  }

  React.useEffect(() => {
    if (defaultValue) {
      getValue();
    }
  }, []);

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
          {value ? value : `Select ${datatype}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={getPlaceholder()} />
          <CommandList className="w-full">
            <CommandEmpty>No {datatype} found.</CommandEmpty>
            <CommandGroup>
              {data.map((data, index) => (
                <CommandItem
                  key={index}
                  value={data.category_name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setSelectedValue(data.category_id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === data.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {data.category_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
