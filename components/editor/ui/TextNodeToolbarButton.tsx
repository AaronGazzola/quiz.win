import { css, cx } from "@emotion/css";
import {
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ToolbarButtonData } from "./ToolbarButtons";
import {
  TEXT_NODE_TOOLBAR_BUTTONS,
  TextNodeToolbarButtonType,
  TOOLBAR_BUTTON_TAGS,
} from "../../../lib/constants";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";
import { useMounted } from "../../../hooks/useMounted";
import { $wrapAncestorElements } from "../lib/text";
import useOnce from "../../../hooks/useOnce";
import ToolTip from "../../ui/ToolTip";

export const TextNodeToolbarButton = ({
  toolbarButton: { tooltip, type, icon },
}: {
  toolbarButton: ToolbarButtonData<TextNodeToolbarButtonType>;
  activeButtons?: { [index: string]: boolean };
}) => {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [activeButtons, setActiveButtons] = useState(
    Object.values(TEXT_NODE_TOOLBAR_BUTTONS).reduce((res, btn) => {
      res[btn] = false;
      return res;
    }, {} as { [index: string]: boolean })
  );
  const [isFirstUpdate, setIsFirstUpdate] = useState(true);
  const mounted = useMounted();
  const isOl = type === TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST;
  const isUl = type === TEXT_NODE_TOOLBAR_BUTTONS.UNORDERED_LIST;

  const formatQuote = () => {
    if (blockType === "quote") {
      formatParagraph();
      return;
    }
    editor.update(() => $wrapAncestorElements(() => $createQuoteNode()));
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || (!mounted && !isFirstUpdate)) return;
    setIsFirstUpdate(false);
    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    const elementKey = element.getKey();
    const elementDOM = editor.getElementByKey(elementKey);

    let type = "";
    if (elementDOM !== null) {
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        type = parentList ? parentList.getType() : element.getTag();
        setBlockType(type);
      } else {
        type = $isHeadingNode(element) ? element.getTag() : element.getType();
        setBlockType(type);
      }
    }
    setActiveButtons(prev => ({
      ...prev,
      bold: selection.hasFormat("bold"),
      underline: selection.hasFormat("underline"),
      italic: selection.hasFormat("italic"),
      code: selection.hasFormat("code"),
      heading1:
        type === TOOLBAR_BUTTON_TAGS[TEXT_NODE_TOOLBAR_BUTTONS.HEADING_1],
      heading2:
        type === TOOLBAR_BUTTON_TAGS[TEXT_NODE_TOOLBAR_BUTTONS.HEADING_2],
      heading3:
        type === TOOLBAR_BUTTON_TAGS[TEXT_NODE_TOOLBAR_BUTTONS.HEADING_3],
      unorderedList:
        type === TOOLBAR_BUTTON_TAGS[TEXT_NODE_TOOLBAR_BUTTONS.UNORDERED_LIST],
      orderedList:
        type === TOOLBAR_BUTTON_TAGS[TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST],
      quote: type === TEXT_NODE_TOOLBAR_BUTTONS.QUOTE,
    }));
  }, [editor, mounted, isFirstUpdate]);

  const formatParagraph = () => {
    if (blockType === "paragraph") return;
    editor.update(() => $wrapAncestorElements(() => $createParagraphNode()));
  };

  const formatHeading = (type: TextNodeToolbarButtonType) => {
    const headingTag = TOOLBAR_BUTTON_TAGS[type];
    if (blockType === headingTag) {
      formatParagraph();
      return;
    }
    editor.update(() =>
      $wrapAncestorElements(() =>
        $createHeadingNode(headingTag as HeadingTagType)
      )
    );
  };

  const formatList = (type: TextNodeToolbarButtonType) => {
    if (blockType === "list") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(
      type === TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST
        ? INSERT_ORDERED_LIST_COMMAND
        : INSERT_UNORDERED_LIST_COMMAND,
      undefined
    );
  };

  const clickHandler: MouseEventHandler<HTMLButtonElement> = (
    e: MouseEvent
  ) => {
    switch (type) {
      case TEXT_NODE_TOOLBAR_BUTTONS.BOLD:
      case TEXT_NODE_TOOLBAR_BUTTONS.ITALIC:
      case TEXT_NODE_TOOLBAR_BUTTONS.UNDERLINE:
      case TEXT_NODE_TOOLBAR_BUTTONS.CODE:
        return editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
      case TEXT_NODE_TOOLBAR_BUTTONS.QUOTE:
        return formatQuote();
      case TEXT_NODE_TOOLBAR_BUTTONS.HEADING_1:
      case TEXT_NODE_TOOLBAR_BUTTONS.HEADING_2:
      case TEXT_NODE_TOOLBAR_BUTTONS.HEADING_3:
        return formatHeading(type);
      case TEXT_NODE_TOOLBAR_BUTTONS.UNORDERED_LIST:
      case TEXT_NODE_TOOLBAR_BUTTONS.ORDERED_LIST:
        return formatList(type);
      default:
        return null;
    }
  };

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useOnce(() => {
    editor.update(() => updateToolbar());
  }, [updateToolbar, editor]);

  return (
    <div key={icon} className={cx("flex items-center justify-center")}>
      <ToolTip
        side='top'
        triggerAsChild
        content={
          <span className={cx("tooltip-single-line", !tooltip && "hidden")}>
            {tooltip}
          </span>
        }
      >
        <button
          className={cx(
            "h-7 w-7 flex items-center justify-center border-gray-200 relative hover:bg-gray-100",
            isUl &&
              css`
                width: 2.1rem;
              `,
            isOl &&
              css`
                width: 2.2rem;
              `,
            isOl && "border-r",
            isUl && "border-l"
          )}
          onClick={clickHandler}
        ></button>
      </ToolTip>
    </div>
  );
};

export default TextNodeToolbarButton;
