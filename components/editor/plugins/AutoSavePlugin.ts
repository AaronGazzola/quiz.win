import { mergeRegister } from "@lexical/utils";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useTimeout from "../../../hooks/useTimeout";
import { isEqual } from "lodash";
import EditorContext from "../../../context/editorContext";
import { LOCAL_STORAGE_EDITOR_KEY } from "../../../lib/constants";

const AutoSavePlugin = () => {
  const { editorState: contextEditorState, onUpdateEditorState } =
    useContext(EditorContext);
  const [editor] = useLexicalComposerContext();
  const [timerValue, setTimerValue] = useState(false);
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  const onResetTimer = useCallback(() => setTimerValue(prev => !prev), []);

  const onSave = useCallback(() => {
    const latestEditorState = editor.getEditorState().toJSON();
    if (isEqual(latestEditorState, contextEditorState) || !initialStateLoaded)
      return;
    onUpdateEditorState(latestEditorState);
    localStorage.setItem(
      LOCAL_STORAGE_EDITOR_KEY,
      JSON.stringify(latestEditorState)
    );
  }, [editor, contextEditorState, onUpdateEditorState, initialStateLoaded]);

  useEffect(() => {
    if (initialStateLoaded) return;
    setInitialStateLoaded(true);
    const localStorageEditorState = localStorage.getItem(
      LOCAL_STORAGE_EDITOR_KEY
    );
    if (!localStorageEditorState) return;
    const editorState = editor.parseEditorState(localStorageEditorState);
    if (!editorState.isEmpty()) editor.setEditorState(editorState);
  }, [initialStateLoaded, editor]);

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
