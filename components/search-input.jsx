"use client";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Search } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

const SearchInput = ({ searchFn }) => {
  const [localSearchTerm, setLocalSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleSearch = () => {
    searchFn(localSearchTerm);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Mobile version using Dialog
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/40 backdrop-blur-sm"
          >
            <Search className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md flex-col">
          <DialogTitle>Search Products</DialogTitle>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              id="search_input_mobile"
              placeholder="Cup noodles, etc..."
              className="flex-1"
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              value={localSearchTerm}
              autoFocus
            />
            <Button
              onClick={handleSearch}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version
  return (
    <>
      <Input
        type="text"
        id="search_input"
        placeholder="Search products..."
        className="w-sm bg-white/40 backdrop-blur-sm ml-2"
        onChange={(e) => setLocalSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        value={localSearchTerm}
      />
      <Button
        onClick={handleSearch}
        className="px-4 py-2 bg-white backdrop-blur-sm border hover:bg-muted transition-colors text-black"
      >
        Search
      </Button>
    </>
  );
};

export default SearchInput;
