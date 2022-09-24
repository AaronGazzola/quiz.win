import { css, cx } from "@emotion/css";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMounted } from "../../../hooks/useMounted";
import useOnce from "../../../hooks/useOnce";
import useOnChange from "../../../hooks/useOnChange";
import { $getDOMRect } from "../lib/shared";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand();

const FloatingToolbar = ({
  editor,
  selectedNode,
  editorShellRef,
  editorId,
}: {
  editor: LexicalEditor;
  selectedNode: LexicalNode | null;
  editorShellRef: React.MutableRefObject<HTMLDivElement | null>;
  editorId: string;
}): JSX.Element => {
  const mounted = useMounted();
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [isFirstUpdate, setIsFirstUpdate] = useState(true);
  const [{ top, left, opacity }, setToolbarStyles] = useState({
    opacity: 0,
    top: -10000,
    left: -10000,
  });

  const updateToolbarHandler = useCallback(() => {
    const selection = $getSelection();
    const isAtNodeStart =
      $isRangeSelection(selection) &&
      selection.isCollapsed() &&
      selection.focus.offset === 0;
    let rect: DOMRect | null | undefined = $getDOMRect(editor);
    const editorShell = editorShellRef?.current;
    if (!rect || !editorShell || (!mounted && !isFirstUpdate)) return;
    setIsFirstUpdate(false);
    const toolbarWidth = toolbarRef.current?.offsetWidth || 366;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 36;
    const positionLeft = rect.left - 6;
    const left = Math.max(
      Math.min(positionLeft, window.innerWidth - toolbarWidth - 24),
      editorShell.offsetLeft + 64
    );
    const top = rect.top - toolbarHeight + window.scrollY;
    setToolbarStyles({
      opacity: 1,
      top,
      left,
    });
  }, [editor, mounted, isFirstUpdate, editorShellRef]);

  useEffect(() => {
    const onResize = () => {
      editor.getEditorState().read(() => {
        updateToolbarHandler();
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [editor, updateToolbarHandler]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbarHandler();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, updateToolbarHandler]);

  useOnce(
    () =>
      editor.getEditorState().read(() => {
        updateToolbarHandler();
      }),
    [updateToolbarHandler, editor]
  );

  useOnChange(
    () => {
      editor.getEditorState().read(() => {
        updateToolbarHandler();
      });
    },
    selectedNode,
    [updateToolbarHandler, editor]
  );

  return (
    <div
      id={`${editorId}-floating-toolbar`}
      ref={toolbarRef}
      className={cx(
        "z-20 absolute",
        css`
          top: ${top}px;
          left: ${left}px;
          opacity: ${opacity};
        `
      )}
    >
      <TextNodeToolbar colorPickerSide={colorPickerSide} />
    </div>
  );
};
export default FloatingToolbar;
