import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
  Heading1,
  Heading2
} from "lucide-react";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-xl p-2 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-2 mb-2">

        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={18} />
        </button>

        <button onClick={setLink}>
          <LinkIcon size={18} />
        </button>

        <button onClick={() => editor.commands.undo()}>
          <Undo size={18} />
        </button>

        <button onClick={() => editor.commands.redo()}>
          <Redo size={18} />
        </button>

      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 border rounded-lg prose"
      />
    </div>
  );
}
