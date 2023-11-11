import { useMemo } from 'react';
import JoditEditor from "jodit-react";
import "../assets/styles.css"

interface EditorComponentProps {
    data: string,
    setData: (data: string) => void,
    theme: string,
    toolbar: boolean
}


export default function EditorComponent({ data, setData, theme, toolbar }: EditorComponentProps) {

    const buttons = [
        "undo",
        "redo",
        "|",
        "bold",
        "strikethrough",
        "underline",
        "italic",
        "|",
        "superscript",
        "subscript",
        "|",
        "align",
        "|",
        "ul",
        "ol",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "link",
        "table",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
        "selectall",
        "print",
        "|",
        "source",
        "|",
    ];

    const editorConfig: any = useMemo(() => ({
        readonly: false,
        toolbar: toolbar,
        spellcheck: true,
        language: "auto",
        zIndex: 0,
        tabIndex: -1,
        theme: theme,
        toolbarButtonSize: "medium",
        toolbarAdaptive: false,
        showCharsCounter: true,
        showWordsCounter: true,
        showXPathInStatusbar: false,
        askBeforePasteHTML: true,
        toolbarSticky: false,
        askBeforePasteFromWord: true,
        buttons: buttons,
        uploader: {
            insertImageAsBase64URI: true
        },
        placeholder: 'Feladat leírása...',
        width: 800,
        height: 550
    }), []
    )

    return (
        <JoditEditor
            value={data}
            config={editorConfig}
            onBlur={(value: string) => setData(value)}
        />
    )
}
