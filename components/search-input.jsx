import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
const SearchInput = () => {
  return (
    <>
      <Input
        type="text"
        id="search_input"
        placeholder="Lucky Me! Bulalo"
        className="w-sm bg-white/40 backdrop-blur-sm ml-2"
      />
      <Button className="px-4 py-2 bg-white backdrop-blur-sm border  hover:bg-muted transition-colors text-black">
        Search
      </Button>
    </>
  );
};

export default SearchInput;
