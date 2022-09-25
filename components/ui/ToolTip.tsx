import { cx } from "@emotion/css";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ReactElement } from "react";
import { useMounted } from "../../hooks/useMounted";

interface ToolTipProps {
  children: ReactElement;
  content: ReactElement;
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  delayDuration?: number;
  triggerAsChild?: boolean;
  contentAsChild?: boolean;
  className?: string;
}

const ToolTip = ({
  children,
  sideOffset = 8,
  content,
  side = "bottom",
  delayDuration = 350,
  triggerAsChild = false,
  contentAsChild = false,
  className = "",
}: ToolTipProps) => {
  const mounted = useMounted();
  if (!mounted) return <>{children}</>;
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger
          className={cx("outline-none", className)}
          asChild={triggerAsChild}
        >
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            asChild={contentAsChild}
            side={side}
            sideOffset={sideOffset}
            className={"z-[100]"}
          >
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default ToolTip;
