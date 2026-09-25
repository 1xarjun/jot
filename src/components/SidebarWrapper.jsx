import { Sidebar } from "./ui/sidebar";
import SidebarHeader from "./sidebar/sidebar-header"

export default function SidebarWrapper({ children }) {
  return (
    <Sidebar collapsible="icon" className="*:bg-background">
      <SidebarHeader />
      {children}
    </Sidebar>
  );
}
