"use client";

import { Search, Pin, Notebook } from "lucide-react";
import Link from "next/link";
import { useCurrentEditor } from "@tiptap/react";
import { Button } from "../ui/button";
import { SidebarHeader, SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Logo from "./logo";
import Add from "../add";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNotesStore } from "@/context/notes-store-context";

export default function Header() {
  const { isMobile, state } = useSidebar();
  const expanded = isMobile || state === "expanded";
  const { setSearchOpen: setOpen } = useNotesStore((s) => s.actions);
  const notes = useNotesStore((s) => s.notes);
  const { debouncedEdit } = useCurrentEditor();

  const pinnedNotes = notes?.filter((note) => note.pinned).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6) ?? [];
  const recentNotes = notes?.filter((note) => !note.pinned).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6) ?? [];

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
                  {pinnedNotes.length === 0 ? (
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground text-xs"
                    >
                      No pinned notes
                    </DropdownMenuItem>
                  ) : (
                    pinnedNotes.map((note) => (
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
