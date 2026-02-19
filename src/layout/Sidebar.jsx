"use client";

import { LogOutIcon } from "@/components/icons/Icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import Avatar from "@/components/avatar";
import Notes from "@/components/notes";
import { handleSignOut } from "@/app/login/actions";
import { LogIn } from "lucide-react";
import Tabs from "@/components/Tabs";
import { PencilRuler } from "lucide-react";
import { Search } from "lucide-react";
import AddModalN from "./AddModalN";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNotes } from "@/zustand/notes";
import { ChevronsUpDown } from "lucide-react";

export default function AppSidebar({ active }) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { notes } = useNotes();

  const filteredNotes = notes.filter(n => n.title.trim().toLowerCase().includes(searchQuery.trim().toLowerCase())) || [];

  return (
    <Sidebar
      className={`${active ? "sm:border-r" : "hidden sm:flex"
        } bg-white/95 dark:bg-[#121212]`}
    >
      <SidebarHeader>
        <div className="flex justify-center items-center m-2">
          <PencilRuler className="w-6 h-6 text-gray-800 dark:text-gray-300" />
        </div>

        <AddModalN />

        <div className="relative group">
          <Input
            maxLength={50}
            type="text"
            name="search"
            placeholder="Search"
            className="flex justify-between items-center"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <span className="absolute top-0 right-0 p-2 h-full flex items-center">
            <Search className="h-4 w-4" />
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <p className="text-gray-800 dark:text-gray-300 px-2.5 py-2 text-xs font-semibold border-b border-dashed">
          Notes
        </p>

        <div className="overflow-y-auto px-2 h-full">
          <Notes notes={filteredNotes} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="flex justify-between items-center text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                  size="lg"
                >
                  <div className="flex gap-2 items-center">
                    <Avatar user={user} />
                    <span className="text-sm truncate">
                      {user ? user.user_metadata.full_name : "username"}
                    </span>
                  </div>

                  <span>
                    <ChevronsUpDown className="w-4 h-4" />
                  </span>

                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                sideOffset={4}
              >
                <DropdownMenuLabel>
                  {user ? user.user_metadata.email : "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await handleSignOut(); //server
                      await supabase.auth.signOut(); //client
                    }}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => router.push("/login")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log in</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-400 text-xs">
                  Preferences
                </DropdownMenuLabel>

                <div className="flex flex-col gap-2 text-sm px-2 pb-2 select-none">
                  <div className="flex justify-between items-center">
                    <span>Theme</span>
                    <Tabs />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
