import { useMemo } from 'react';
import JoditEditor from "jodit-react";
import "../assets/styles.css"
import { useTranslation } from 'react-i18next';

interface EditorComponentProps {
    data: string,
    setData: (data: string) => void,
    theme: string,
    toolbar: boolean,
    tabIndex?: number
}


export default function EditorComponent({ data, setData, theme, toolbar, tabIndex }: EditorComponentProps) {

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

    const { t, ready } = useTranslation()

    const editorConfig: any = useMemo(() => ({
        readonly: false,
        toolbar: toolbar,
        spellcheck: true,
        language: "auto",
        zIndex: 0,
        tabIndex: tabIndex ? tabIndex : -1,
        theme: theme,
        cleanHTML: {
            fillEmptyParagraph: false
        },
        toolbarButtonSize: "medium",
        toolbarAdaptive: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        askBeforePasteHTML: true,
        toolbarSticky: false,
        askBeforePasteFromWord: true,
        buttons: buttons,
        uploader: {
            insertImageAsBase64URI: true
        },
        placeholder: t("projectlist.label_issue_description_plus"),
        width: 800,
        height: 550
    }), []
    )

    if (ready)
        return (
            <JoditEditor
                value={data}
                config={editorConfig}
                onBlur={(value: string) => setData(value)}
            />
        )
}
