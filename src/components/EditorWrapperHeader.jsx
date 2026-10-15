"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Pin,
  PinOff,
  Save,
  MoreHorizontalIcon,
  Share,
  Clipboard,
  BanIcon,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthProvider";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { useCurrentEditor } from "@tiptap/react";
import { useNotesStore } from "@/context/notes-store-context";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useEditorState } from "@tiptap/react";
import { toast } from "sonner";
import { TooltipContent, TooltipTrigger, Tooltip } from "./ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { create, remove, update } from "@/app/actions/notes";
import { queryClient } from "@/query/client";
import { removeFromCache, shiftTo } from "@/query/helper";

export default function EditorWrapperHeader({
  focusingNote,
  isShared = undefined,
}) {
  const {
    editNote,
    deleteNote,
    saveNote,
    setShareDialogIsOpen,
    setSelectedNoteForSharing,
    shareIt,
    revoke,
  } = useNotesStore((s) => s.actions);

  const titleFormRef = useRef(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { editor } = useCurrentEditor();
  const router = useRouter();
  const selectedNoteForSharing = useNotesStore((s) => s.selectedNoteForSharing);
  const shared = useNotesStore((s) => s.shared);
  const [pending, startTransition] = useTransition();
  const [revokePending, startRevoking] = useTransition();

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isEmpty: editor?.isEmpty ?? true, // when editor is undefined or null it returns true otherwise returns editor.isEmpty
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }) => {
      const { success, message } = await remove(id);
      if (!success) throw new Error(message);
    },

    onSuccess: (_, variables) => {
      // variables.id is available even after this line cause it holds a copy
      router.replace("/");
      // this is safe to run even if the cache doesn't exist
      queryClient.removeQueries({ queryKey: ["note", variables.id], exact: true });
      removeFromCache(["filtered_notes"], variables.id);
      removeFromCache(["pinned_notes"], variables.id);
    },
    onError: (error) => toast.error(error.message),
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, content }) => {
      if (!title) throw new Error('Invalid title');
      const { data, success, message } = await create({ title, content });
      if (!success) throw new Error(message);
      return data;
    },
    onSuccess: (newNote) => {
      shiftTo(['filtered_notes'], newNote);
    },
    onError: (error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { success, message, data: $ } = await update(id, data);
      if (!success) throw new Error(message);
      return $;
    },

    onSuccess: (updatedNote, variables) => {
      queryClient.setQueryData(["note", variables.id], (prev) => ({
        ...prev,
        ...updatedNote,
      }));
      removeFromCache(['filtered_notes'], variables.id);
      removeFromCache(['pinned_notes'], variables.id);
      updatedNote?.pinned ? shiftTo(['pinned_notes'], updatedNote) : shiftTo(['filtered_notes'], updatedNote);
    },

    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-3xl mx-auto group/heading mt-10 lg:mt-0 px-8 md:px-0">
      <span className="text-3xl font-bold wrap-break-word inline">
        {focusingNote?.title ?? "Untitled"}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            ref={titleFormRef}
            action={(formData) => {
              titleFormRef?.current.reset();
              //               const note = {
              //                 id: nanoid(32),
              //                 title: formData.get("title"),
              //                 content: editor.getJSON(),
              //                 created_at: new Date().toISOString(),
              //                 updated_at: new Date().toISOString(),
              //                 pinned: false,
              //               };
              //
              //               if (!note.title) return;
              //               saveNote(note);
              createMutation.mutate({ title: formData.get('title'), content: editor.getJSON() });
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Save As</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Input
                maxLength={200}
                type="text"
                placeholder="Enter note title"
                name="title"
                className="w-full"
                required
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
              render={
                <Button size="sm" type="button" variant="outline">
                  Cancel
                </Button>
              }
              />
              <Button size="sm" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost"
            className="inline-flex ml-1 align-top md:opacity-0 md:group-hover/heading:opacity-100"
          >
            <MoreHorizontalIcon />
          </Button>
        }
        />

        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={editorState?.isEmpty ?? true}
              role="button"
              onClick={() => setOpen(true)}
            >
              <Save /> Save As
            </DropdownMenuItem>
            {!isShared && (
              <>
                <DropdownMenuItem
                  role="button"
                  disabled={!focusingNote}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMutation.mutate({ id: focusingNote?.id, data: { pinned: !focusingNote?.pinned } });
                  }}
                >
                  {focusingNote?.pinned ? (
                    <>
                      <PinOff /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin /> Pin
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  role="button"
                  disabled={!focusingNote || !user}
                  onClick={(e) => {
                    e.stopPropagation(); // stop invoking parent
                    setSelectedNoteForSharing(focusingNote);
                    setShareDialogIsOpen(true);
                  }}
                >
                  <Share /> Share
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>

          {!isShared && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  role="button"
                  disabled={!focusingNote}
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id: focusingNote?.id })}
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// {false && (
//   <Dialog open={shareDialogIsOpen} onOpenChange={setShareDialogIsOpen}>
//     <DialogContent className="flex flex-col gap-4">
//       <form
//         key={`${selectedNoteForSharing?.id}-${sharedEntry?.token ?? "draft"}`}
//         action={(formData) => {
//           const expiredAt = formData.get("expired_at");
//           if (!expiredAt) return;
//           startTransition(
//             async () =>
//               await shareIt(
//                 selectedNoteForSharing?.id,
//                 new Date(expiredAt).toISOString(),
//               ),
//           );
//         }}
//       >
//         <DialogHeader>
//           <DialogTitle>Share Note</DialogTitle>
//           <DialogDescription>
//             Anyone with the link can view this note
//           </DialogDescription>
//         </DialogHeader>
//         <FieldGroup className="mt-5">
//           <Field>
//             <Label htmlFor="note_title">Note Title</Label>
//             <Input
//               tabIndex={-1}
//               type="text"
//               placeholder="Enter note title"
//               name="title"
//               className="w-full"
//               value={selectedNoteForSharing?.title ?? "???"}
//               readOnly
//               required
//               id="note_title"
//             />
//           </Field>
//
//           <Field>
//             <Label htmlFor="expiry_date">Expiry Date</Label>
//             <Input
//               min={
//                 sharedEntry
//                   ? undefined
//                   : (() => {
//                     const d = new Date();
//                     d.setDate(d.getDate() + 1);
//                     return d.toISOString().split("T")[0];
//                   })()
//               }
//               type="date"
//               id="expiry_date"
//               name="expired_at"
//               className="w-full"
//               defaultValue={sharedEntry?.expired_at?.split("T")[0] ?? ""}
//               readOnly={!!sharedEntry?.expired_at}
//               required={!sharedEntry?.expired_at}
//             />
//             <span className="text-xs text-muted-foreground">
//               The link expires on this date
//             </span>
//           </Field>
//         </FieldGroup>
//         <DialogFooter className="mt-5">
//           {!sharedEntry ? (
//             <Button
//               disabled={pending}
//               type="submit"
//               className="w-full"
//               size="sm"
//             >
//               {pending ? "Generating..." : "Generate Link"}
//             </Button>
//           ) : (
//             <FieldGroup>
//               <Field>
//                 <Label>Access Link</Label>
//
//                 <div className="flex gap-2.5 items-center w-full">
//                   <div className="w-full relative overflow-hidden rounded-md">
//                     <Input
//                       type="url"
//                       value={`${window.location.origin}/share/${sharedEntry?.token}`}
//                       readOnly
//                     />
//
//                     <div className="absolute right-0 top-0 h-full px-2.5 flex items-center bg-secondary/50">
//                       <Tooltip>
//                         <TooltipTrigger
//                           render={
//                             <button
//                               className="[&_svg]:size-4 hover:text-muted-foreground"
//                               type="button"
//                               onClick={async () => {
//                                 try {
//                                   await window.navigator.clipboard.writeText(
//                                     `${window.location.origin}/share/${sharedEntry?.token}`,
//                                   );
//                                   toast.success(
//                                     "Link copied to clipboard",
//                                   );
//                                 } catch (err) {
//                                   toast.error(err?.message ?? err);
//                                 }
//                               }}
//                             >
//                               <Clipboard />
//                             </button>
//                           }
//                         />
//                         <TooltipContent>Copy</TooltipContent>
//                       </Tooltip>
//                     </div>
//                   </div>
//                   <Tooltip>
//                     <TooltipTrigger
//                       render={
//                         <Button
//                           disabled={revokePending}
//                           type="button"
//                           size="icon-sm"
//                           variant="destructive"
//                           onClick={() => {
//                             startRevoking(
//                               async () => {
//                                 await revoke(sharedEntry?.token);
//                               }
//                             );
//                           }}
//                         >
//                           <BanIcon />
//                         </Button>
//                       }
//                     />
//                     <TooltipContent side="top">
//                       Revoke Access
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//               </Field>
//             </FieldGroup>
//           )}
//         </DialogFooter>
//       </form>
//     </DialogContent>
//   </Dialog>
// )}
