"use client";

import { Button } from "@/components/ui/button";
import { useNotes } from "@/zustand/notes";
import { LogOutIcon, UserIcon } from "@/components/icons/Icons";
import { nanoid } from "nanoid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import Avatar from "@/components/avatar";
import Notes from "@/components/notes";
import { create } from "@/app/actions/notes";
import { useRef } from "react";
import { handleSignOut } from "@/app/login/actions";
import { LogIn } from "lucide-react";
import { CreditCard } from "lucide-react";
import Tabs from "@/components/Tabs";

export default function Sidebar({ active }) {
  const router = useRouter();
  const supabase = createClient();

  const { saveNote, editNote, deleteNote } = useNotes((state) => state.actions);
  const titleFormRef = useRef(null);
  const { user } = useAuth();

  const defaultContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Type here to get started..." }],
      },
    ],
  };

  return (
    <div
      tabIndex={0}
      // transition-all duration-300
      style={{ transition: "width 0.3s ease-in-out, padding 0.3s ease-in-out" }}
      className={`fixed bg-white/95 dark:bg-[#121212] sm:bg-transparent dark:sm:bg-transparent z-20 sm:z-0 sm:static  overflow-hidden border-[#ddd] dark:border-[#212121] h-full ${active ? "w-0 p-0 border-0 sm:w-75 sm:p-2 sm:border-r" : "w-70 p-2 border-r sm:w-0 sm:p-0 sm:border-0"} flex flex-col text-nowrap select-none`}
    >
      <form
        ref={titleFormRef}
        action={async (formData) => {
          titleFormRef?.current.reset();
          const supabase_like_date = new Date().toISOString();
          const note = {
            id: nanoid(10),
            title: formData.get("title"),
            content: defaultContent,
            created_at: supabase_like_date,
          };

          saveNote(note);

          if (!user) return;

          const response = await create(formData);
          if (!response.success) {
            deleteNote(note.id);
          } else {
            editNote(note.id, response.data);
          }
        }}
        className="flex flex-col gap-2"
      >
        <input
          autoFocus
          name="title"
          type="text"
          placeholder="Enter a title"
          maxLength={50}
          className="focus:outline-0 h-10 text-center"
          required
        />
        <Button
          variant="outline"
          type="submit"
          className="active:bg-gray-100 hover:bg-gray-50"
        >
          Create
        </Button>
      </form>

      <p className="text-gray-800 dark:text-gray-300 py-2 my-2 border-b border-[#ddd] dark:border-[#333] border-dashed">
        Notes
      </p>

      <Notes />

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-gray-500 dark:outline-blue-500 outline-offset-4 w-full flex gap-2 justify-start items-center h-10 p-1 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 mt-2 border rounded-md shadow-xs">
          <Avatar user={user} />
          <span className="text-text">
            {user ? user.user_metadata.full_name : "username"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={4}
          className={"font-inter w-[17rem] mb-2 drop-shadow-xs"}
        >
          <DropdownMenuLabel>
            {user ? user.user_metadata.email : "My Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UserIcon />
            Team
          </DropdownMenuItem>
          {user ? (
            <DropdownMenuItem
              onClick={async () => {
                await handleSignOut(); //server
                await supabase.auth.signOut(); //client
              }}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => router.push("/login")}>
              <LogIn />
              Log in
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-gray-500 dark:text-neutral-400">
            Preferences
          </DropdownMenuLabel>

          <div className="flex flex-col gap-1 text-sm px-2 pb-2 select-none">
            <div className="flex justify-between items-center">
              <span>Theme</span>
              <Tabs />
            </div>
            <div>Language</div>
          </div>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
