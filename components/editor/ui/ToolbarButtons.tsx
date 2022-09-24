import { ReactNode } from "react";
import {
  TextNodeToolbarButtonType,
  TEXT_NODE_TOOLBAR_BUTTONS,
} from "../../../lib/constants";

export interface ToolbarButtonData<T> {
  tooltip: ReactNode;
  icon?: string;
  type: T;
}

export const TextNodeToolbarButtons: ToolbarButtonData<TextNodeToolbarButtonType>[] =
  [
    {
      tooltip: (
        <>
          <span>Bold</span>
        </>
      ),
      type: TEXT_NODE_TOOLBAR_BUTTONS.BOLD,
      icon: "bold",
    },
    {
      tooltip: (
        <>
          <span>Italic</span>
        </>
      ),
      type: TEXT_NODE_TOOLBAR_BUTTONS.ITALIC,
      icon: "italic",
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.UNDERLINE,
      icon: "underlined",
      tooltip: (
        <>
          <span>Underline</span>
        </>
      ),
    },
    {
      tooltip: (
        <>
          <span>Code</span>
        </>
      ),
      type: TEXT_NODE_TOOLBAR_BUTTONS.CODE,
      icon: "code",
    },
    {
      tooltip: (
        <>
          <span>Quote</span>
        </>
      ),
      type: TEXT_NODE_TOOLBAR_BUTTONS.QUOTE,
      icon: "quote",
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.HEADING_1,
      icon: "heading1",
      tooltip: "Heading 1",
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.HEADING_2,
      icon: "heading2",
      tooltip: "Heading 2",
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.HEADING_3,
      icon: "heading3",
      tooltip: "Heading 3",
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.UNORDERED_LIST,
      icon: "list_bulleted",
      tooltip: (
        <>
          <span>Bulleted list</span>
          <strong style={{ letterSpacing: "0em" }}>•</strong>
        </>
      ),
    },
    {
      type: TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST,
      icon: "list_numbered",
      tooltip: (
        <>
          <span>Numbered list</span>
          <strong>1.</strong>
        </>
      ),
    },
    {
      tooltip: "Insert link",
      type: TEXT_NODE_TOOLBAR_BUTTONS.LINK,
      icon: "link",
    },
  ];
