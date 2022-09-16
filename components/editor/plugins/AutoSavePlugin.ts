import { mergeRegister } from "@lexical/utils";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useTimeout from "../../../hooks/useTimeout";
import { isEqual } from "lodash";
import EditorContext from "../../../context/editorContext";

const AutoSavePlugin = () => {
  const { editorState, onUpdateEditorState } = useContext(EditorContext);
  const [editor] = useLexicalComposerContext();
  const [timerValue, setTimerValue] = useState(false);
  const onResetTimer = useCallback(() => setTimerValue(prev => !prev), []);

  const onSave = useCallback(() => {
    const latestEditorState = editor.getEditorState().toJSON();
    if (isEqual(latestEditorState, editorState)) return;
    onUpdateEditorState(latestEditorState);
  }, [editor, editorState, onUpdateEditorState]);

  useTimeout(timerValue, onSave, 500);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        onResetTimer();
      }),
      editor.registerDecoratorListener(() => {
        onResetTimer();
      })
    );
  }, [editor, onResetTimer]);
  return null;
};

export default AutoSavePlugin;
