"use client";

import AuthProvider from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Error from "@/components/error";
import { queryClient } from "@/query/client";
import { QueryClientProvider } from "@tanstack/react-query";
import NotesStoreProvider from "@/context/notes-store-provider";

export default function Providers({ children }) {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <NotesStoreProvider>
        <AuthProvider>
          <SidebarProvider>
          <TooltipProvider>
            {children}
            <Toaster style={{ fontFamily: 'var(--font-sans)' }} theme={theme} />
            <Suspense fallback={null}>
              <Error />
            </Suspense>
          </TooltipProvider>
        </SidebarProvider>
      </AuthProvider>
      </NotesStoreProvider>
    </QueryClientProvider>
  );
}
