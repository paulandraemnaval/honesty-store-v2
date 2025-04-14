"use client";
import ProductsDisplay from "@/components/products-display";
import Providers from "@/contexts/providers";
import React from "react";

export default function page() {
  return (
    <Providers>
      <ProductsDisplay customer={true} />
    </Providers>
  );
}
