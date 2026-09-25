"use client";

import { LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { handleSignOut } from "@/app/login/actions";
import { LogIn } from "lucide-react";
import { SidebarFooter, SidebarMenuButton, useSidebar } from "./ui/sidebar";
import Avatar from "./avatar";
import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { createClient } from "@/utils/supabase/client";
import { useNotesStore } from "@/context/notes-store-context";

export default function SidebarUser({ user }) {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const desktopExpanded = !isMobile && state === "expanded";
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const { reset: resetStore } = useNotesStore(s => s.actions);

  const handleLogOut = async () => {
    await handleSignOut(); //server
    await supabase.auth.signOut(); //client
    resetStore();
    router.replace("/")
  };

  return (
    <SidebarFooter className={`${desktopExpanded ? "border-t" : ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size={state === "collapsed" && !isMobile ? "icon" : "default"}
              className={
                state === "collapsed" && !isMobile
                  ? "flex items-center justify-center rounded-full p-0 size-9 mx-auto mb-2.5"
                  : "flex gap-2.5 items-center text-foreground h-10"
              }
            >
              <Avatar user={user} />
              {!(state === "collapsed" && !isMobile) && (
                <span className="truncate">
                  {user ? user.user_metadata.full_name : "Profile"}
                </span>
              )}
            </SidebarMenuButton>
          }
        />
        <DropdownMenuContent
          className={cn("w-60", !isMobile && state === "collapsed" && "mb-2")}
          side={!isMobile && state === "collapsed" ? "right" : "top"}
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex gap-2.5 items-center">
              <Avatar user={user} />
              <div className="w-full flex flex-col gap-0.5">
                <span className="text-sm text-foreground">
                  {user?.user_metadata.full_name ?? "Profile"}
                </span>
                <span className="font-normal">
                  {user?.user_metadata.email ?? "example@mail.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                    {theme === "light" && (
                      <DropdownMenuShortcut>
                        <Check />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                    {theme === "dark" && (
                      <DropdownMenuShortcut>
                        <Check />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                    {theme === "system" && (
                      <DropdownMenuShortcut>
                        <Check />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem variant="destructive" onClick={handleLogOut}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => router.push("/login")}>
                <LogIn />
                Log in
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          {/* <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-gray-500 dark:text-neutral-400 text-xs">
              Preferences
            </DropdownMenuLabel>
            <div className="px-2 pb-2 flex justify-between items-center">
              <span className="text-sm">Theme</span>
              <Tabs />
            </div>
          </DropdownMenuGroup>*/}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
