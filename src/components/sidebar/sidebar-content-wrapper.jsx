"use client";

import { SidebarContent } from "../ui/sidebar";
import NotesWrapper from "./notes-wrapper";
import { useSidebar } from "../ui/sidebar";

export default function SidebarContentWrapper({ children }) {
  const { state, isMobile } = useSidebar();

  const collapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarContent className="p-2 gap-4 overflow-y-auto overflow-x-hidden">
      {collapsed ? null : children}
    </SidebarContent>
  );
}
