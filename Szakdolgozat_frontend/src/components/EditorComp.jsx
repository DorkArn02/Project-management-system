import React, { useRef, useCallback } from "react";
import List from "@editorjs/list"
import EHeader from "@editorjs/header"
import CheckList from "@editorjs/checklist"
import Code from "@editorjs/code"
import ETable from "@editorjs/table"

// create editor instance
import { createReactEditorJS } from "react-editor-js";

export default function EditorComp({ data, setData }) {
    const editorCore = useRef(null);
    const ReactEditorJS = createReactEditorJS();

    const handleInitialize = useCallback((instance) => {
        // await instance._editorJS.isReady;
        instance._editorJS.isReady
            .then(() => {
                // set reference to editor
                editorCore.current = instance;
            })
            .catch((err) => console.log("An error occured", err));
    }, []);

    const handleSave = useCallback(async () => {
        // retrieve data inserted
        const savedData = await editorCore.current.save();
        // save data
        setData(savedData);
    }, [setData]);

    return (
        <div className="editor-container">
            <ReactEditorJS
                onInitialize={handleInitialize}
                tools={{ code: Code, table: ETable, list: List, header: EHeader, checkList: CheckList }}
                onChange={handleSave}
                defaultValue={data}
            />
        </div>
    );
}
