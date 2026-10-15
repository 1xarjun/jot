"use client";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Field, FieldGroup } from "@/components/ui/field";
import { useSidebar } from "./ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useNotesStore } from "@/context/notes-store-context";
import { useMutation } from "@tanstack/react-query";
import { create } from "@/app/actions/notes";
import { shiftTo } from "@/query/helper";
import { toast } from "sonner";

export default function Add() {
  const titleFormRef = useRef(null);
  const { state, isMobile } = useSidebar();
  const { saveNote } = useNotesStore(s=> s.actions);
  const collapsed = !isMobile && state === "collapsed";

  const createMutation = useMutation({
    mutationFn: async ({ title, content }) => {
      const { data, success, message } = await create({ title, content });
      if (!success) throw new Error(message);
      return data;
    },
    onSuccess: (newNote) => {
      shiftTo(['filtered_notes'], newNote);
    },
    onError: (error) => toast.error(error.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    titleFormRef?.current.reset();
    // const note = {
    //   id: nanoid(32),
    //   title: formData.get('title'),
    //   content: undefined,
    //   created_at: new Date().toISOString(),
    //   updated_at: new Date().toISOString(),
    //   pinned: false,
    // }
    // saveNote(note);
    createMutation.mutate({ title: formData.get('title'), content: undefined });
  }

  return (
    <Dialog>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon-sm">
                    <Plus />
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="right">New Note</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="justify-start font-normal w-full"
            >
              <Plus /> New Note
            </Button>
          }
        />
      )}
      <DialogContent>
        <form
          ref={titleFormRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
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
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
