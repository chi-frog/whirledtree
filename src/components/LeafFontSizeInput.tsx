'use client'

import { MouseEventHandler, useLayoutEffect, useRef, useState } from "react";
import TextBox from "./svg/TextBox";
import { Font, FontTb } from "@/hooks/useFont";
import { Leaf } from "@/hooks/useLeaves";

const _ = {
  font: {
    maxSize: 1638,
  }
}

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

      if (parseInt(newFontSize) > _.font.maxSize) return;
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
    e.preventDefault();
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize-1)
  };

  const rightArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize+1)
  };

  const inputPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
  }

  console.log('w', width);

  const rightArrowDims = fontTb.getDims(" >", systemFont, systemFontSize);
  const textDims = fontTb.getDims("" + leaf.fontSize, systemFont, systemFontSize);

  return (<svg
      x={x-2}
      y={y-2}
      width={width+4}
      height={height+4}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: "none",
      }}>
    <TextBox
      x={2} y={2} width={width-4} padding={{x: 2, y: 2}}
      cornerRadiusX={3}
      font={systemFont} fontSize={systemFontSize} fontTb={fontTb}>
      <tspan style={{
        userSelect: "none",
        }}
        onMouseDown={leftArrowPressed}>{'< '}</tspan>
      <tspan
        onMouseDown={inputPressed}>{"" + leaf.fontSize}</tspan>
      <tspan style={{
        userSelect: "none",
        }}
        onMouseDown={rightArrowPressed}>{' >'}</tspan>
    </TextBox>
    <rect
      x={2} y={2} width={width} height={height}
      rx={3}
      fill="white" />
    <text
      className="cursor-pointer"
      x={4} y={2 + height/2 + rightArrowDims.height/2 - rightArrowDims.textHeightGap}
      onMouseDown={leftArrowPressed}
      >
      {"< "}
    </text>
    <text
      className="cursor-pointer"
      x={width - rightArrowDims.width} y={2 + height/2 + rightArrowDims.height/2 - rightArrowDims.textHeightGap}
      onMouseDown={rightArrowPressed}
      >
      {" >"}
    </text>
    <text
      className="cursor-text"
      x={4 + width/2 - textDims.width/2} y={height/2 + textDims.height/2}
      onMouseDown={inputPressed}>
      {leaf.fontSize}
    </text>
  </svg>);
}