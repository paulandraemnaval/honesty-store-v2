"use client";
import GlobalContextProvider from "@/contexts/global-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function Layout({ children }) {
  return (
    <GlobalContextProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GlobalContextProvider>
  );
}
