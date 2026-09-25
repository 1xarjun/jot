"use client";

import { useEditorState } from "@tiptap/react";
import { Button } from "@/components/ui/button";

import {
  Blend,
  BoldIcon,
  UnderlineIcon,
  ItalicIcon,
  Heading2Icon,
  Heading1Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  Unlink,
  UndoIcon,
  RedoIcon,
  Code,
} from "lucide-react";
import { useRef } from "react";

export default function EditorToolbar({ editor }) {
  const editorToolbarRef = useRef(null);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      isLink: ctx.editor?.isActive("link") ?? false,
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
    }),
  });

  const handleLink = () => {
    const prevLink = editor.getAttributes("link").href; // check if link exists
    if (prevLink) {
      // if it has link just remove it
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt("Enter your url: ");
      if (!url) return;
      try {
        const valid = new URL(url);
        editor.chain().focus().toggleLink({ href: valid.href }).run();
      } catch {
        return alert("URL is not valid");
      }
    }
  };

  return (
    <div
      ref={editorToolbarRef}
      className="w-fit max-w-full sm:max-w-xl md:max-w-2xl xl:max-w-none mx-auto flex gap-2 items-center border-t sm:border p-1.5 xl:rounded-xs bg-background shadow-xs transition-opacity duration-300 overflow-x-auto xl:overflow-x-visible z-30 editor-toolbar"
    >
      <div className="flex gap-1 flex-shrink-0">
        <Button
          title="Bold"
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`${editorState?.isBold ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <BoldIcon />
        </Button>

        <Button
          title="Italic"
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`${editorState?.isItalic ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <ItalicIcon />
        </Button>

        <Button
          title="Underline"
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`${editorState?.isUnderline ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <UnderlineIcon />
        </Button>

        <Button
          title="Strikethrough"
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`${editorState?.isStrike ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <StrikethroughIcon />
        </Button>

        <Button
          title="Code"
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`${editorState?.isCodeBlock ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <Code />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          title="Heading 1"
          variant="ghost"
          size={"icon-sm"}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`${editorState?.isH1 ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <Heading1Icon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
          className={`${editorState?.isH2 ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <Heading2Icon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
          className={`${editorState?.isH3 ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <Heading3Icon />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          className={`${editorState?.isBulletList ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <ListIcon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
          className={`${editorState?.isOrderedList ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <ListOrderedIcon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          className={`${editorState?.isBlockquote ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <Quote />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Align Left"
          className={`${editorState?.isAlignLeft ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <AlignLeft />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Align Center"
          className={`${editorState?.isAlignCenter ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <AlignCenter />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Align Right"
          className={`${editorState?.isAlignRight ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <AlignRight />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => handleLink()}
          title="Link"
          className={`${editorState?.isLink ? "selected" : "active:bg-gray-100 hover:bg-gray-50"} rounded-xs`}
        >
          <LinkIcon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().unsetLink().run()}
          disabled={!editorState?.isLink}
          title="Unlink"
          className={`active:bg-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xs`}
        >
          <Unlink />
        </Button>
      </div>

      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>

      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editorState?.canUndo}
          title="Undo"
          className={`active:bg-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xs`}
        >
          <UndoIcon />
        </Button>
        <Button
          variant="ghost"
          size={"icon-sm"}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editorState?.canRedo}
          title="Redo"
          className={`active:bg-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xs`}
        >
          <RedoIcon />
        </Button>
      </div>
      <div className="w-px h-5 bg-border mx-1 flex-shrink-0"></div>
      <div className="flex-shrink-0">
        <Button
          title="Toggle Opacity"
          onClick={() => {
            const $ = editorToolbarRef.current;
            if ($) {
              if ($.classList.contains("opacity-30")) {
                $.classList.remove("opacity-30");
              } else {
                $.classList.add("opacity-30");
              }
            }
          }}
          variant="ghost"
          size={"icon-sm"}
          className="active:bg-gray-100 hover:bg-gray-50 rounded-xs"
        >
          <Blend />
        </Button>
      </div>
    </div>
  );
}
