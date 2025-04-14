"use client";
import Providers from "@/contexts/providers";

export default function Layout({ children }) {
  return <Providers>{children}</Providers>;
}
