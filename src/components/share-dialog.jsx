"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Clipboard, BanIcon } from "lucide-react";
import { toast } from "sonner";
import { getSharedEntry, revokeAccess, share } from "@/app/actions/notes";
import { useNotesStore } from "@/context/notes-store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { queryClient } from "@/query/client";
import NotesSkeleton from "@/components/skeletons/notes-skeleton";

export default function ShareDialog() {
  const open = useNotesStore((s) => s.shareDialogIsOpen);
  const note = useNotesStore(s => s.selectedNoteForSharing);
  const { setShareDialogIsOpen } = useNotesStore(
    (s) => s.actions,
  );
  const { data: sharedEntry, isLoading } = useQuery({
    queryKey: ["shared", note?.id],
    queryFn: async () => {
      const { data, success, message } = await getSharedEntry(note?.id);
      if (!success) throw new Error(message);
      return data;
    },
    enabled: open && !!note?.id,
  });

  const shareMutation = useMutation({
    mutationFn: async ({ noteId, expiredAt }) => {
      const result = await share({
        note_id: noteId,
        expired_at: expiredAt,
      });
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Note shared successfully");
      queryClient.setQueryData(["shared", variables.noteId], data);
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async (token) => {
      const result = await revokeAccess(token);
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success("Access revoked successfully");
      queryClient.setQueryData(["shared", note?.id], null);
    },
    onError: (error) => toast.error(error.message),
  });

  const link = sharedEntry
    ? `${window.location.origin}/share/${sharedEntry.token}`
    : "";

  return (
    <Dialog open={open} onOpenChange={setShareDialogIsOpen}>
      <DialogContent className="flex flex-col gap-4">
        <form
          key={`${note?.id}-${sharedEntry?.token ?? "draft"}`}
          action={(formData) => {
            const expiredAt = formData.get("expired_at");
            if (!expiredAt) return;
            shareMutation.mutate({
              noteId: note?.id,
              expiredAt: new Date(expiredAt).toISOString(),
            });
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
                name="title"
                value={note?.title ?? "???"}
                readOnly
                required
                id="note_title"
              />
            </Field>
            {isLoading ? (
              <NotesSkeleton />
            ) : (
              <Field>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  min={
                    sharedEntry
                      ? undefined
                      : new Date(Date.now() + 86400000)
                          .toISOString()
                          .split("T")[0]
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
            )}
          </FieldGroup>
          {!isLoading && <DialogFooter className="mt-5">
            {!sharedEntry ? (
              <Button
                disabled={shareMutation.isPending}
                type="submit"
                className="w-full"
                size="sm"
              >
                {shareMutation.isPending ? "Generating..." : "Generate Link"}
              </Button>
            ) : (
              <FieldGroup>
                <Field>
                  <Label>Access Link</Label>
                  <div className="flex gap-2.5 items-center w-full">
                    <div className="w-full relative overflow-hidden rounded-md">
                      <Input type="url" value={link} readOnly />
                      <div className="absolute right-0 top-0 h-full px-2.5 flex items-center bg-secondary/50">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                className="[&_svg]:size-4 hover:text-muted-foreground"
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(link);
                                    toast.success("Link copied to clipboard");
                                  } catch (error) {
                                    toast.error(error?.message ?? error);
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
                            disabled={revokeMutation.isPending}
                            type="button"
                            size="icon-sm"
                            variant="destructive"
                            onClick={() =>
                              revokeMutation.mutate(sharedEntry.token)
                            }
                          >
                            <BanIcon />
                          </Button>
                        }
                      />
                      <TooltipContent side="top">Revoke Access</TooltipContent>
                    </Tooltip>
                  </div>
                </Field>
              </FieldGroup>
            )}
          </DialogFooter>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
