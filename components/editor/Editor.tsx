import theme from "./theme";
import Nodes from "./nodes/Nodes";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

const Plugins = () => {
  return (
    <>
      <div id='editor-shell' className='editor-shell'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className='ContentEditable__root' />
          }
          placeholder={<div className='editor-placeholder'>Placeholder</div>}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
    </>
  );
};

const Editor = () => {
  const onError = (error: Error) => console.error(error);

  const initialConfig = {
    theme,
    onError,
    nodes: [...Nodes],
    namespace: "Quiz.win",
  };

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <Plugins />
      </LexicalComposer>
    </div>
  );
};

export default Editor;
