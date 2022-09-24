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
