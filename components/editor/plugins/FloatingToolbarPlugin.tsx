import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  LexicalEditor,
  LexicalNode,
} from "lexical";
import { useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AlertContext from "../../../context/alertContext";
import { EDITOR_ID } from "../../../lib/constants";
import { $getSelectedNode } from "../lib/shared";
import FloatingToolbar from "../ui/FloatingToolbar";

const useFloatingToolbar = (
  editor: LexicalEditor,
  editorId: string,
  editorShellRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const [selectedNode, setSelectedNode] = useState<LexicalNode | null>(null);
  const { alert } = useContext(AlertContext);

  const updateToolbarHandler = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) return;
      const selection = $getSelection();
      const node = $getSelectedNode();

      if ($isRangeSelection(selection)) {
        if (
          !selection.isCollapsed() &&
          selection.getTextContent() !== "" &&
          (selection.getTextContent().length > 1 ||
            selection.getTextContent().charCodeAt(0) !== 10) &&
          $isTextNode(node)
        ) {
          setSelectedNode(node);
          return;
        }
        setSelectedNode(null);
        return;
      }

      setSelectedNode(null);
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarHandler);
    return () => {
      document.removeEventListener("selectionchange", updateToolbarHandler);
    };
  }, [updateToolbarHandler]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateToolbarHandler();
    });
  }, [editor, updateToolbarHandler]);

  if (!selectedNode || alert) return null;
  return createPortal(
    <FloatingToolbar
      editor={editor}
      selectedNode={selectedNode}
      editorShellRef={editorShellRef}
      editorId={editorId}
    />,
    document.body
  );
};

const FloatingToolbarPlugin = ({
  editorShellRef,
  editorId = EDITOR_ID,
}: {
  editorShellRef: React.MutableRefObject<HTMLDivElement | null>;
  editorId?: string;
}): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingToolbar(editor, editorId, editorShellRef);
};

export default FloatingToolbarPlugin;
