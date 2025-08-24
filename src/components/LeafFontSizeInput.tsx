'use client'

import { useLayoutEffect, useRef, useState } from "react";
import TextBox from "./svg/TextBox";
import { Font, FontTb } from "@/hooks/useFont";
import { Leaf } from "@/hooks/useLeaves";

type Props = {
  leaf:Leaf,
  y:number,
  width:number,
  height:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  systemFont:Font,
  systemFontSize:number,
  fontTb:FontTb,
}

export default function LeafFontSizeInput({
    leaf, y, width, height, notifyParentFocused,
    notifyChangeFontSize,
    systemFont, systemFontSize, fontTb} : Props) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    const numberRegex = /^\d+$/;
    let newFontSize = "" + leaf.fontSize;

    if (numberRegex.test(e.key)) {
      newFontSize = newFontSize + e.key;

      if (parseInt(newFontSize) > 1638) return;
    } else {
      // Here we enable certain functionality
      switch (e.key) {
        case "Backspace":
          newFontSize = newFontSize.slice(0, newFontSize.length-1);
          break;
        case "Delete":
          newFontSize = "";
          break;
        default: return;
      }
    }

    const fontSizeParsed = parseInt(newFontSize);
    if(notifyChangeFontSize)
      notifyChangeFontSize(isNaN(fontSizeParsed) ? 0 : fontSizeParsed);
  }

  const handleMouseDown:React.MouseEventHandler<SVGSVGElement> = (e) => {
    e.stopPropagation();
    setFocused(true);
  }

  const handleMouseUp:React.MouseEventHandler<SVGSVGElement> = (e) => {
    e.stopPropagation();
};

  const handleBlur = () => {
    setFocused(false);
    if (notifyParentFocused)
      notifyParentFocused(false);
  }

  const handleFocus = () => {
    setFocused(true);
    if (notifyParentFocused)
      notifyParentFocused(true);
  }

  useLayoutEffect(() => {
    if (focused && ref.current)
      ref.current?.focus();
  }, [focused]);

  return (
    <svg
      x={0}
      y={y}
      width={width}
      height={height}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: focused ? "1px solid yellow" : "none",
        cursor: "text",
      }}>
    <TextBox x={0} y={0} padding={{x: 5, y: 2}} cornerRadiusX={5}
      text={"" + leaf.fontSize}
      font={systemFont} fontSize={systemFontSize} fontTb={fontTb} />
    </svg>
  );
}