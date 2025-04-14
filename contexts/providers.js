"use client";

import GlobalContextProvider from "@/contexts/global-context";
import QueryProvider from "@/contexts/query-context";

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </QueryProvider>
  );
}
