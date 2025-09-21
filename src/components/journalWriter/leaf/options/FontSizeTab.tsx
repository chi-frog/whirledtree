'use client'

import { MouseEventHandler, useContext, useLayoutEffect, useRef, useState } from "react";
import { calcFontDims, Font } from "@/hooks/useFonts";
import { Leaf } from "@/hooks/useLeaves";
import { useSystemFontContext } from "../../JournalWriter";

const _ = {
  font: {
    maxSize: 1638,
    minSize: 4,
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
}

const FontSizeTab:React.FC<Props> = ({
    leaf, x, y, width, height, notifyParentFocused,
    notifyChangeFontSize} : Props) => {
  const systemFont = useSystemFontContext();
  const [focused, setFocused] = useState(false);
  const [fontSize, setFontSize] = useState('' + leaf.font.size);
  const ref = useRef<SVGSVGElement>(null);
  const fontSizeOutOfBounds = ((val:number) =>
    (val > _.font.maxSize) || (val < _.font.minSize))(parseInt(fontSize));

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    const numberRegex = /^\d+$/; // A number
    let newFontSize = fontSize;

    if (numberRegex.test(e.key)) {
      newFontSize = newFontSize + e.key;

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
          let newFontSizeParsed = parseInt(newFontSize);

          if (newFontSizeParsed > _.font.maxSize) {
            newFontSizeParsed = _.font.maxSize;
            setFontSize('' + _.font.maxSize);

          } else if (newFontSizeParsed < _.font.minSize) {
            newFontSizeParsed = _.font.minSize;
            setFontSize('' + _.font.minSize);
          }

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
    if (focused && ref.current)
      ref.current.focus();
  }, [focused, ref.current]);

  const leftArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if ((leaf.font.size <= 4)) return;

    setFontSize('' + (leaf.font.size - 1));
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.font.size - 1)
  };

  const rightArrowPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if ((leaf.font.size > _.font.maxSize)) return;

    setFontSize('' + (leaf.font.size + 1));
    if (notifyChangeFontSize)
      notifyChangeFontSize(leaf.font.size + 1);
  };

  const inputPressed:MouseEventHandler<SVGTSpanElement> = (e) => {
    e.stopPropagation();
  }

  const rightArrowDims = calcFontDims(" >", systemFont);
  
  return (<svg
      x={x - 2}
      y={y - 2}
      width={width + 4}
      height={height + 4}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseUp={(e) => handleMouseUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      style={{
        outline: "none",
      }}>
    <rect
      className={focused ? fontSizeOutOfBounds ? "fill-red-200" :
                                                 "fill-green-300" :
                           "fill-white"}
      x={2} y={2} width={width} height={height}
      rx={3}
      />
    <text
      className="cursor-pointer hover:stroke-green-300"
      x={4} y={2 + height/2 + rightArrowDims.height/2 - rightArrowDims.textHeightGap}
      strokeWidth={2}
      onMouseDown={leftArrowPressed}
      >
      {"< "}
    </text>
    <text
      className="cursor-pointer hover:stroke-green-300"
      x={width - rightArrowDims.width} y={2 + height/2 + rightArrowDims.height/2 - rightArrowDims.textHeightGap}
      strokeWidth={2}
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

export default FontSizeTab;