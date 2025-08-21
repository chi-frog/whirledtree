'use client'

import { MouseEvent, useLayoutEffect, useRef, useState } from "react";
import TextBox from "./svg/TextBox";
import { Dimension, Font, FontTb } from "@/hooks/useFont";

type LeafInputProps = {
  width:number,
  height:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  parentWidth:number,
  parentHeight:number,
  systemFont:Font,
  fontSize:number,
  fontTb:FontTb,
  leafFontSize:number,
}

export default function LeafInput({
    width, height, notifyParentFocused,
    notifyChangeFontSize, parentWidth, parentHeight,
    systemFont, fontSize, fontTb, leafFontSize} : LeafInputProps) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    const numberRegex = /^\d+$/;
    let newFontSize = "" + leafFontSize;

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
      x={parentWidth/2 - width/2}
      y={parentHeight/2 - height/2}
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
    <TextBox x={0} y={0} padding={{
        x: 5,
        y: 2
      }} cornerRadiusPercentage={0} text={""}
      font={systemFont} fontSize={fontSize} fontTb={fontTb} />
    <rect
      width={width}
      height={height}
      rx={5}
      fill="white">
    </rect>
    <text
      x={'50%'}
      y={'50%'}
      dominantBaseline={'middle'}
      textAnchor={'middle'}
      fontSize={fontSize}>
      {""+leafFontSize}
    </text>
    </svg>
  );
}