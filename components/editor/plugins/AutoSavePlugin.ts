import { mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useTimeout from "../../../hooks/useTimeout";

const AutoSavePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [timerValue, setTimerValue] = useState(false);
  const onResetTimer = useCallback(() => setTimerValue(prev => !prev), []);

  const onSave = useCallback(() => {}, []);

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
