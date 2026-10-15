"use client";

import { Search, Pin, Notebook } from "lucide-react";
import Link from "next/link";
import { useCurrentEditor } from "@tiptap/react";
import { Button } from "../ui/button";
import { SidebarHeader, SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Logo from "./logo";
import Add from "../add";
import { queryClient } from "@/query/client";
import { useNotesStore } from "@/context/notes-store-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
  const { isMobile, state } = useSidebar();
  const expanded = isMobile || state === "expanded";
  const setOpen = useNotesStore((s) => s.actions.setSearchOpen);
  const { debouncedEdit } = useCurrentEditor();

  const filteredNotes = queryClient
    .getQueryData(["filtered_notes"])
    ?.pages?.flatMap((page) => page.notes || []) || [];
  const pinnedNotes = queryClient
    .getQueryData(["pinned_notes"])
    ?.pages?.flatMap((page) => page.notes || []) || [];

  const sortByUpdatedAt = (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
  const recentNotes = filteredNotes
    .filter((note) => !note.pinned)
    .sort(sortByUpdatedAt)
    .slice(0, 5);
  const recentPinnedNotes = pinnedNotes
    .sort(sortByUpdatedAt)
    .slice(0, 5);

  return (
    <SidebarHeader
      data-collapsed={!expanded}
      className="gap-4 border-b data-[collapsed=true]:border-b-0"
    >
      {expanded ? (
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex gap-0.5 items-center">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setOpen(true)}
                  >
                    <Search />
                  </Button>
                }
              />
              <TooltipContent side="bottom">Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<SidebarTrigger />} />
              <TooltipContent side="bottom">Toggle Sidebar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger />} />
            <TooltipContent side="right">Toggle Sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Add />
        {!expanded && (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setOpen(true)}
                  >
                    <Search />
                  </Button>
                }
              />
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <Pin />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="right">Pinned</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Pinned</DropdownMenuLabel>
                  {recentPinnedNotes.length === 0 ? (
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground text-xs"
                    >
                      No pinned notes
                    </DropdownMenuItem>
                  ) : (
                    recentPinnedNotes.map((note) => (
                      <DropdownMenuItem
                        key={note.id}
                        render={
                          <Link
                            onClick={() => debouncedEdit?.flush()}
                            href={`/n/${note.id}`}
                            className="w-full"
                          >
                            <span className="truncate">
                              {note.title?.trim() || "Untitled"}
                            </span>
                          </Link>
                        }
                      />
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <Notebook />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="right">Recents</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Recents</DropdownMenuLabel>
                  {recentNotes.length === 0 ? (
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground text-xs"
                    >
                      No recent notes
                    </DropdownMenuItem>
                  ) : (
                    recentNotes.map((note) => (
                      <DropdownMenuItem
                        key={note.id}
                        render={
                          <Link
                            onClick={() => debouncedEdit?.flush()}
                            href={`/n/${note.id}`}
                            className="w-full"
                          >
                            <span className="truncate">
                              {note.title?.trim() || "Untitled"}
                            </span>
                          </Link>
                        }
                      />
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </SidebarHeader>
  );
}
