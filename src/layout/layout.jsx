"use client";

import AppSidebar from "@/layout/Sidebar";
import Editor from "@/layout/Editor";
import AuthProvider from "@/context/AuthProvider";
import ThemeProvider from "@/context/ThemeProvider";
import { useMount } from "@/context/mount-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout() {
  const { mounted } = useMount();

  return (
    <AuthProvider>
      <ThemeProvider mounted={mounted}>
        <TooltipProvider>
          <SidebarProvider>
            <div className="relative flex w-screen h-dvh text-sm bg-white dark:bg-[#111] overflow-hidden">
            
              <AppSidebar />

              <div className="flex flex-col sm:flex-row w-full overflow-y-auto">
                <SidebarTrigger className="m-4" />
                <div className="w-full">
                  <Editor />
                </div>
              </div>

            </div>
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
