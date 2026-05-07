import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";

// Custom FontSize extension built on top of TextStyle
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: { chain: () => ReturnType<typeof chain> }) =>
          (chain() as any).setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => ReturnType<typeof chain> }) =>
          (chain() as any)
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

const FONT_SIZES = [
  { label: "Pequeno", value: "0.85rem" },
  { label: "Normal", value: "" },
  { label: "Grande", value: "1.25rem" },
  { label: "Título", value: "1.75rem" },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const btn =
  "px-2 py-1 rounded text-sm border border-border hover:bg-accent transition-colors disabled:opacity-40";
const activeCls = "bg-primary text-primary-foreground border-primary";

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const active = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs) ? activeCls : "";

  return (
    <div className="rounded-md border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/40">
        {/* Text style */}
        <button
          type="button"
          title="Negrito"
          className={`${btn} font-bold ${active("bold")}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          title="Itálico"
          className={`${btn} italic ${active("italic")}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          title="Sublinhado"
          className={`${btn} underline ${active("underline")}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <button
          type="button"
          title="Tachado"
          className={`${btn} line-through ${active("strike")}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </button>

        <span className="w-px bg-border mx-1" />

        {/* Headings */}
        <button
          type="button"
          title="Título grande"
          className={`${btn} ${active("heading", { level: 2 })}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          title="Subtítulo"
          className={`${btn} ${active("heading", { level: 3 })}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          title="Texto normal"
          className={`${btn} ${!editor.isActive("heading") && !editor.isActive("bulletList") && !editor.isActive("orderedList") ? activeCls : ""}`}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          ¶
        </button>

        <span className="w-px bg-border mx-1" />

        {/* Font size */}
        <select
          title="Tamanho da fonte"
          className="px-2 py-1 rounded text-sm border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              (editor.chain().focus() as any).unsetFontSize().run();
            } else {
              (editor.chain().focus() as any).setFontSize(v).run();
            }
          }}
          defaultValue=""
        >
          {FONT_SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="w-px bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          title="Lista com marcadores"
          className={`${btn} ${active("bulletList")}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • —
        </button>
        <button
          type="button"
          title="Lista numerada"
          className={`${btn} ${active("orderedList")}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. —
        </button>

        <span className="w-px bg-border mx-1" />

        {/* Align */}
        <button
          type="button"
          title="Alinhar à esquerda"
          className={`${btn} ${active("textAlign", { textAlign: "left" })}`}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ≡←
        </button>
        <button
          type="button"
          title="Centralizar"
          className={`${btn} ${active("textAlign", { textAlign: "center" })}`}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ≡
        </button>
        <button
          type="button"
          title="Alinhar à direita"
          className={`${btn} ${active("textAlign", { textAlign: "right" })}`}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ≡→
        </button>

        <span className="w-px bg-border mx-1" />

        {/* Block quote */}
        <button
          type="button"
          title="Citação"
          className={`${btn} ${active("blockquote")}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          title="Remover formatação"
          className={btn}
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          ✕
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]"
      />
    </div>
  );
}
