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
            <style>{`
                .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5em !important; margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
                .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
                .ProseMirror li { margin-bottom: 0.25em !important; }
                .ProseMirror h1 { font-size: 2.5rem !important; font-weight: 800 !important; margin-top: 1.5rem !important; margin-bottom: 1rem !important; line-height: 1.2 !important; }
                .ProseMirror h2 { font-size: 1.8rem !important; font-weight: 700 !important; margin-top: 1.2rem !important; margin-bottom: 0.8rem !important; line-height: 1.3 !important; }
                .ProseMirror blockquote { border-left: 4px solid #3b82f6 !important; padding-left: 1rem !important; font-style: italic !important; margin: 1rem 0 !important; color: #64748b !important; }
            `}</style>
            <div className="max-w-5xl mx-auto bg-slate-100 dark:bg-slate-800 min-h-screen py-3 px-2 rounded-xl">
                <EditorContent editor={editor} />
            </div>
            <div className="max-w-5xl mx-auto h-11"></div>
        </>
    );
}

export default NoteEditor;