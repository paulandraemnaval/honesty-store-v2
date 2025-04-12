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

const data = [
  {
    category_name: "Canned Goods",
    category_image: "https://via.placeholder.com/150?text=Canned+Goods",
    category_description:
      "Shelf-stable food items including meat, vegetables, and sauces.",
  },
  {
    category_name: "Beverages",
    category_image: "https://via.placeholder.com/150?text=Beverages",
    category_description:
      "Drinks such as juice, soda, milk, and energy drinks.",
  },
  {
    category_name: "Instant Noodles",
    category_image: "https://via.placeholder.com/150?text=Instant+Noodles",
    category_description: "Ready-to-cook noodle packs for quick meals.",
  },
  {
    category_name: "Snacks",
    category_image: "https://via.placeholder.com/150?text=Snacks",
    category_description: "Chips, biscuits, and other packaged munchies.",
  },
  {
    category_name: "Dairy Products",
    category_image: "https://via.placeholder.com/150?text=Dairy+Products",
    category_description:
      "Milk, cheese, butter, and other perishable dairy items.",
  },
];

export default function ComboBox({ name }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? data.find((data) => data.category_name === value)?.category_name
            : `Select ${name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${name}`} />
          <CommandList className="w-full">
            <CommandEmpty>No Categories found.</CommandEmpty>
            <CommandGroup>
              {data.map((data) => (
                <CommandItem
                  key={data.category_name}
                  value={data.category_name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
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
