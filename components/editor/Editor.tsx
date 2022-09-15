import theme from "./theme";
import Nodes from "./nodes/Nodes";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useContext, useEffect, useState } from "react";
import AlertContext from "../../context/alertContext";

const Plugins = () => {
  return (
    <>
      <div id='editor-shell' className='editor-shell'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className='ContentEditable__root' />
          }
          placeholder={<div className='editor-placeholder'>Type here!</div>}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
    </>
  );
};

const Editor = () => {
  const { onShowAlert } = useContext(AlertContext);
  const onError = (error: Error) => onShowAlert({ message: error.message });

  const initialConfig = {
    theme,
    onError,
    nodes: [...Nodes],
    namespace: "Quiz.win",
  };

  return (
    <div className='editor-container'>
      <LexicalComposer initialConfig={initialConfig}>
        <Plugins />
      </LexicalComposer>
    </div>
  );
};

export default Editor;
