import { $isAtNodeEnd } from "@lexical/selection";
import {
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  LexicalEditor,
  LexicalNode,
} from "lexical";

export function $getSelectedNode(): LexicalNode | undefined {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
      return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
      return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
      return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
  }
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    return nodes[nodes.length - 1];
  }
}

export const $getDOMRect = (editor: LexicalEditor): DOMRect | null => {
  const selection = $getSelection();
  const nativeSelection = window.getSelection();

  const rootElement = editor.getRootElement();
  if (
    selection !== null &&
    nativeSelection !== null &&
    rootElement !== null &&
    rootElement.contains(nativeSelection.anchorNode)
  ) {
    const domRange = nativeSelection.getRangeAt(0);
    if (nativeSelection.anchorNode === rootElement) {
      let inner = rootElement;
      while (inner.firstElementChild != null) {
        inner = inner.firstElementChild as HTMLElement;
      }
      return inner.getBoundingClientRect();
    } else {
      return domRange.getBoundingClientRect();
    }
  }
  return null;
};
