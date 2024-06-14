import { useState, useEffect, useRef } from "react";

interface CollapseContainerProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}

const CollapseContainer: React.FC<CollapseContainerProps> = ({
  isCollapsed,
  children,
}) => {
  const [maxHeight, setMaxHeight] = useState<string | number>("none");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isCollapsed) return setMaxHeight(0);
    setMaxHeight(contentRef.current.scrollHeight);
  }, [isCollapsed]);

  return (
    <div
      style={{
        maxHeight: maxHeight,
        overflow: "hidden",
        transition: "max-height 0.5s ease-in-out",
      }}
      ref={contentRef}
    >
      {children}
    </div>
  );
};

export default CollapseContainer;
