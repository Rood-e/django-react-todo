import { useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function NoteEditor({ initialContent, onChange, isArchived }) {
    const editor = useEditor({
        editable: !isArchived,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                bulletList: true,
                orderedList: true,
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-slate dark:prose-invert max-w-none text-xl min-h-[500px] leading-relaxed cursor-text p-10',
            },
        },
    });

    // Sincronizza l'editor se il contenuto cambia esternamente (es. caricamento task)
    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent || "");
        }
    }, [initialContent, editor]);

    if (!editor) return null;

    return (
        <div className="max-w-5xl mx-auto">
            <EditorContent editor={editor} />
        </div>
    );
}

export default NoteEditor;