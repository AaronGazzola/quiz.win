import { $wrapLeafNodesInElements } from "@lexical/selection";
import {
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isRangeSelection,
  ElementNode,
  LexicalNode,
} from "lexical";
import { $getAncestorNode } from "./shared";

export const $wrapAncestorElements = (onWrap: () => ElementNode) => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  const nodes = selection.getNodes();
  if (!nodes.some(node => $isDecoratorNode(node))) {
    $wrapLeafNodesInElements(selection, onWrap);
    return;
  }
  const ancestorElementNodes = nodes.reduce(
    (nodes: ElementNode[], node: LexicalNode) => {
      const ancestorNode = $getAncestorNode(node);
      if (
        nodes.some(n => n.__key && n.__key === ancestorNode?.__key) ||
        !$isElementNode(ancestorNode)
      )
        return nodes;
      nodes.push(ancestorNode);
      return nodes;
    },
    []
  );
  ancestorElementNodes.forEach(node => {
    node.selectEnd();
    const sel = $getSelection();
    if (!$isRangeSelection(sel)) return;
    $wrapLeafNodesInElements(sel, onWrap);
  });
};
