import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Button } from "antd";
import { useEffect, useMemo } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Escribe aquí...",
}: RichTextEditorProps) => {
  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value ?? "",
    onUpdate: ({ editor: editorInstance }) => {
      onChange?.(editorInstance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) {
      return;
    }
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <Button
          type={editor.isActive("bold") ? "primary" : "text"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrita"
          size="small"
        >
          <BoldOutlined />
        </Button>
        <Button
          type={editor.isActive("italic") ? "primary" : "text"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Cursiva"
          size="small"
        >
          <ItalicOutlined />
        </Button>
        <Button
          type={editor.isActive("strike") ? "primary" : "text"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Tachado"
          size="small"
        >
          <StrikethroughOutlined />
        </Button>
        <Button
          type={editor.isActive("bulletList") ? "primary" : "text"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista con viñetas"
          size="small"
        >
          <UnorderedListOutlined />
        </Button>
        <Button
          type={editor.isActive("orderedList") ? "primary" : "text"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada"
          size="small"
        >
          <OrderedListOutlined />
        </Button>
        <Button
          type="text"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Deshacer"
          size="small"
        >
          <UndoOutlined />
        </Button>
        <Button
          type="text"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Rehacer"
          size="small"
        >
          <RedoOutlined />
        </Button>
      </div>
      <EditorContent editor={editor} className="rich-text-content" />
    </div>
  );
};
