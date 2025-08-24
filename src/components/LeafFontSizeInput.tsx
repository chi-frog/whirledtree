'use client'

import { MouseEventHandler, useLayoutEffect, useRef, useState } from "react";
import TextBox from "./svg/TextBox";
import { Font, FontTb } from "@/hooks/useFont";
import { Leaf } from "@/hooks/useLeaves";

type Props = {
  leaf:Leaf,
  x:number,
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
    leaf, x, y, width, height, notifyParentFocused,
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

  const leftArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize-1)
  };

  const rightArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize+1)
  };

  return (
    <svg
      x={x-1}
      y={y-1}
      width={width+2}
      height={height+2}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: focused ? "1px solid yellow" : "none",
        cursor: "text",
      }}>

    <TextBox x={1} y={1} padding={{x: 2, y: 2}} cornerRadiusX={3}
      font={systemFont} fontSize={systemFontSize} fontTb={fontTb}>
      <tspan
        onMouseDown={leftArrowPressed}>{'< '}</tspan>
      <tspan>{"" + leaf.fontSize}</tspan>
      <tspan
        onMouseDown={rightArrowPressed}>{' >'}</tspan>
    </TextBox>
    </svg>
  );
}