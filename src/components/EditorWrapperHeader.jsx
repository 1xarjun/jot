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

  const shareDialogIsOpen = useNotesStore((s) => s.shareDialogIsOpen);
  const titleFormRef = useRef(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { editor } = useCurrentEditor();
  const router = useRouter();
  const selectedNoteForSharing = useNotesStore((s) => s.selectedNoteForSharing);
  const shared = useNotesStore((s) => s.shared);
  const [pending, startTransition] = useTransition();
  const [revokePending, startRevoking] = useTransition();
  const sharedEntry = shared.find(
    (s) => s.note_id === selectedNoteForSharing?.id,
  );

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isEmpty: editor?.isEmpty ?? true, // when editor is undefined or null it returns true otherwise returns editor.isEmpty
    }),
  });

  const handleDelete = () => {
    if (focusingNote) {
      deleteNote(focusingNote.id);
      router.replace("/");
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-3xl mx-auto group/heading mt-10 lg:mt-0 px-8 md:px-0">
      <span className="text-3xl font-bold wrap-break-word inline">
        {focusingNote?.title ?? "Untitled"}
      </span>

      {!isShared && (
        <Dialog open={shareDialogIsOpen} onOpenChange={setShareDialogIsOpen}>
          <DialogContent className="flex flex-col gap-4">
            <form
              key={`${selectedNoteForSharing?.id}-${sharedEntry?.token ?? "draft"}`}
              action={(formData) => {
                const expiredAt = formData.get("expired_at");
                if (!expiredAt) return;
                startTransition(
                  async () =>
                    await shareIt(
                      selectedNoteForSharing?.id,
                      new Date(expiredAt).toISOString(),
                    ),
                );
              }}
            >
              <DialogHeader>
                <DialogTitle>Share Note</DialogTitle>
                <DialogDescription>
                  Anyone with the link can view this note
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="mt-5">
                <Field>
                  <Label htmlFor="note_title">Note Title</Label>
                  <Input
                    tabIndex={-1}
                    type="text"
                    placeholder="Enter note title"
                    name="title"
                    className="w-full"
                    value={selectedNoteForSharing?.title ?? "???"}
                    readOnly
                    required
                    id="note_title"
                  />
                </Field>

                <Field>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    min={
                      sharedEntry
                        ? undefined
                        : (() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d.toISOString().split("T")[0];
                        })()
                    }
                    type="date"
                    id="expiry_date"
                    name="expired_at"
                    className="w-full"
                    defaultValue={sharedEntry?.expired_at?.split("T")[0] ?? ""}
                    readOnly={!!sharedEntry?.expired_at}
                    required={!sharedEntry?.expired_at}
                  />
                  <span className="text-xs text-muted-foreground">
                    The link expires on this date
                  </span>
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-5">
                {!sharedEntry ? (
                  <Button
                    disabled={pending}
                    type="submit"
                    className="w-full"
                    size="sm"
                  >
                    {pending ? "Generating..." : "Generate Link"}
                  </Button>
                ) : (
                  <FieldGroup>
                    <Field>
                      <Label>Access Link</Label>

                      <div className="flex gap-2.5 items-center w-full">
                        <div className="w-full relative overflow-hidden rounded-md">
                          <Input
                            type="url"
                            value={`${window.location.origin}/share/${sharedEntry?.token}`}
                            readOnly
                          />

                          <div className="absolute right-0 top-0 h-full px-2.5 flex items-center bg-secondary/50">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <button
                                    className="[&_svg]:size-4 hover:text-muted-foreground"
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await window.navigator.clipboard.writeText(
                                          `${window.location.origin}/share/${sharedEntry?.token}`,
                                        );
                                        toast.success(
                                          "Link copied to clipboard",
                                        );
                                      } catch (err) {
                                        toast.error(err?.message ?? err);
                                      }
                                    }}
                                  >
                                    <Clipboard />
                                  </button>
                                }
                              />
                              <TooltipContent>Copy</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                disabled={revokePending}
                                type="button"
                                size="icon-sm"
                                variant="destructive"
                                onClick={() => {
                                  startRevoking(
                                    async () => {
                                      await revoke(sharedEntry?.token);
                                    }
                                  );
                                }}
                              >
                                <BanIcon />
                              </Button>
                            }
                          />
                          <TooltipContent side="top">
                            Revoke Access
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </Field>
                  </FieldGroup>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            ref={titleFormRef}
            action={(formData) => {
              titleFormRef?.current.reset();
              const note = {
                id: nanoid(32),
                title: formData.get("title"),
                content: editor.getJSON(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pinned: false,
              };

              if (!note.title) return;
              saveNote(note);
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
                    const pinned = !focusingNote?.pinned;
                    editNote(focusingNote?.id, { pinned });
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
                  onClick={handleDelete}
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
