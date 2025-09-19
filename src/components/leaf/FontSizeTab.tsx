'use client'

import { MouseEventHandler, useLayoutEffect, useRef, useState } from "react";
import TextBox from "../journalWriter/svg/TextBox";
import { Font, FontTb } from "@/hooks/useFonts";
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
  const [fontSize, setFontSize] = useState('' + leaf.fontSize);
  const ref = useRef<SVGSVGElement>(null);

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    const numberRegex = /^\d+$/;
    let newFontSize = fontSize;

    if (numberRegex.test(e.key)) {
      newFontSize = newFontSize + e.key;
      const newFontSizeParsed = parseInt(newFontSize);

      if ((newFontSizeParsed > _.font.maxSize) ||
          (newFontSizeParsed < 4)) return;

    } else {
      // Here we enable certain functionality
      switch (e.key) {
        case "Backspace":
          newFontSize = newFontSize.slice(0, newFontSize.length-1);
          break;
        case "Delete":
          newFontSize = "";
          break;
        case "Enter":
          const newFontSizeParsed = parseInt(newFontSize);
          if(notifyChangeFontSize)
            notifyChangeFontSize(isNaN(newFontSizeParsed) ? 0 : newFontSizeParsed);
        default: return;
      }
    }

    setFontSize(newFontSize);
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
    if (focused && ref.current) {
      ref.current?.focus();
    }
  }, [focused]);

  const leftArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if ((leaf.fontSize <= 4)) return;

    setFontSize('' + (leaf.fontSize-1));
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize-1)
  };

  const rightArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if ((leaf.fontSize > _.font.maxSize)) return;

    setFontSize('' + (leaf.fontSize+1));
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.fontSize+1)
  };

  const inputPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
  }

  const rightArrowDims = fontTb.getDims(" >", systemFont, systemFontSize);

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
    <rect
      x={2} y={2} width={width} height={height}
      rx={3}
      fill={focused ? 'rgba(211, 175, 55, 0.2)' : "white"} />
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
      x={width/2 + 2} y={height/2 + 4}
      textAnchor={'middle'}
      dominantBaseline={'middle'}
      onMouseDown={inputPressed}>
      {fontSize}
    </text>
  </svg>);
}