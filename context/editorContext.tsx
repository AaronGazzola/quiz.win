import { SerializedEditorState } from "lexical";
import { createContext, useCallback, useState } from "react";

export interface EditorContextData {
  editorState: SerializedEditorState | null;
  onUpdateEditorState: (editorState: SerializedEditorState) => void;
}

const EditorContext = createContext<EditorContextData>({
  editorState: null,
  onUpdateEditorState: () => {},
});

export function EditorContextProvider(props: { children: React.ReactNode }) {
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(
    null
  );

  const onUpdateEditorState = useCallback(
    (state: SerializedEditorState) => setEditorState(state),
    []
  );

  const context: EditorContextData = {
    editorState,
    onUpdateEditorState,
  };

  return (
    <EditorContext.Provider value={context}>
      {props.children}
    </EditorContext.Provider>
  );
}

export default EditorContext;
