"use client";
import ProductsDisplay from "@/components/products-display";
import GlobalContextProvider from "@/contexts/global-context";
import QueryContextProvider from "@/contexts/query-context";
import React from "react";

const page = () => {
  return (
    <GlobalContextProvider>
      <QueryContextProvider>
        <ProductsDisplay customer={true} />
      </QueryContextProvider>
    </GlobalContextProvider>
  );
};

export default page;
