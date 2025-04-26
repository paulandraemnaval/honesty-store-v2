"use client";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
const SearchInput = ({ searchFn }) => {
  const [localSeachTerm, setLocalSearchTerm] = React.useState("");
  return (
    <>
      <Input
        type="text"
        id="search_input"
        placeholder="search products..."
        className="w-sm bg-white/40 backdrop-blur-sm ml-2"
        onChange={(e) => {
          setLocalSearchTerm(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            searchFn(localSeachTerm);
          }
        }}
        value={localSeachTerm}
      />
      <Button className="px-4 py-2 bg-white backdrop-blur-sm border  hover:bg-muted transition-colors text-black">
        Search
      </Button>
    </>
  );
};

export default SearchInput;
