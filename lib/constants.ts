export const LOCAL_STORAGE_EDITOR_KEY = "QUIZ_WIN_EDITOR";

export const TEXT_NODE_TOOLBAR_BUTTONS = {
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  CODE: "code",
  HEADING_1: "heading1",
  HEADING_2: "heading2",
  HEADING_3: "heading3",
  ORDERED_LIST: "orderedList",
  UNORDERED_LIST: "unorderedList",
  QUOTE: "quote",
} as const;

export type TextNodeToolbarButtonType =
  typeof TEXT_NODE_TOOLBAR_BUTTONS[keyof typeof TEXT_NODE_TOOLBAR_BUTTONS];

export const TOOLBAR_BUTTON_TAGS = {
  [TEXT_NODE_TOOLBAR_BUTTONS.HEADING_1]: "h1",
  [TEXT_NODE_TOOLBAR_BUTTONS.HEADING_2]: "h2",
  [TEXT_NODE_TOOLBAR_BUTTONS.HEADING_3]: "h3",
  [TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST]: "ol",
  [TEXT_NODE_TOOLBAR_BUTTONS.UNORDERED_LIST]: "ul",
  [TEXT_NODE_TOOLBAR_BUTTONS.QUOTE]: "blockquote",
} as { [index: string]: string };

export const EDITOR_ID = "editor";
