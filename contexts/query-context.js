"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        refetchOnMount: false,
      },
    },
  });
}

let clientSingleton;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  clientSingleton = clientSingleton || makeQueryClient();
  return clientSingleton;
}

export default function QueryProvider({ children }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
