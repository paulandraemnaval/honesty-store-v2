import "@/styles/globals.css";
import {
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-[100vh] w-full  bg-mainButton overflow-x-hidden">
        <div className="w-full h-full flex flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
