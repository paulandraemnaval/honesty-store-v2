"use client";
import GlobalContextProvider from "@/contexts/global-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

export default function Layout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </QueryClientProvider>
  );
}
