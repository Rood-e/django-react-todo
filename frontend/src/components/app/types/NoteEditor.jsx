import { useEffect } from "react";
import { EditorContent } from '@tiptap/react';

function NoteEditor({ editor, initialContent, isArchived }) {
    // Sincronizza l'editor se il contenuto cambia esternamente (es. caricamento task)
    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent || "");
        }
    }, [initialContent, editor]);

    useEffect(() => {
        if (editor)
            editor.setEditable(!isArchived);
    }, [isArchived, editor]);

    if (!editor) return null;

    return (
        <>
            <div className="max-w-5xl mx-auto bg-amber-50 dark:bg-slate-800 min-h-screen py-3 px-2 rounded-xl">
                <EditorContent editor={editor} />
            </div>
            <div className="max-w-5xl mx-auto h-11"></div>
        </>
    );
}

export default NoteEditor;