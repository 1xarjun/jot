"use client"

import { Dialog, DialogClose, DialogFooter, DialogTitle, DialogHeader, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/zustand/notes";
import { useRef } from "react";
import { create } from "@/app/actions/notes";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { PencilIcon } from "lucide-react";
import { Field, FieldGroup } from "@/components/ui/field";

export default function AddModalN() {

    const titleFormRef = useRef(null);
    const { user } = useAuth();

    const { saveNote, editNote, deleteNote } = useNotes((state) => state.actions);

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
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="flex justify-between items-center w-full">
                    Add <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
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

                        if(!note.title) return;

                        saveNote(note);

                        if (!user) return;

                        const response = await create(formData);
                        if (!response.success) {
                            deleteNote(note.id);
                        } else {
                            editNote(note.id, response.data);
                        }
                    }}


                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>Add note</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Input maxLength={50} type="text" placeholder="Enter note title" name="title" className="w-full" />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
