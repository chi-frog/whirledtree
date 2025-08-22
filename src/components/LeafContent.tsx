'use client'

import { Leaf } from "@/hooks/useLeaves";
import { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import Cursor from "./Cursor";
import { Dimension } from "@/hooks/useFont";

const _ = {
  cursor: {
    padding: {
      x:1,
      y:1,
    }
  },
  text: {
    padding: {
      x:5,
      y:2,
    }
  },
  border: {
    padding: {
      x:5,
      y:5,
    }
  }
}

type Props = {
  leaf:Leaf,
  ref:any,
  selected:boolean,
  focused:boolean,
  textDims:Dimension,
  cursorDims:Dimension,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  handleOnBlur?:FocusEventHandler<SVGTextElement>,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

const LeafContent:React.FC<Props> = ({
    leaf, ref, selected, focused,
    textDims, cursorDims,
    handleMouseDown, handleMouseUp, handleOnBlur,
    handleKeyDown, handleKeyUp}:Props) => {

  const svgY = leaf.y - textDims.textHeight - textDims.textHeightGap;

  return (<svg
      x={leaf.x}
      y={svgY}
      width={textDims.width + cursorDims.width + _.text.padding.x*2 + _.cursor.padding.x*2}
      height={textDims.height + _.text.padding.y*2}>
    <text
      x={2}
      y={leaf.y - svgY + 2}
      data-elementid={leaf.id}
      ref={ref} tabIndex={0} 
      fontSize={leaf.fontSize}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        fontFamily: leaf.font.name,
        whiteSpace: "break-spaces",
        outline: (focused) ? "1px solid gold" : 
                 (selected) ? "1px solid blue" : "none",
        userSelect: "none",
      }}>
      <tspan>
        {leaf.content}
      </tspan>
    </text>
    {focused &&
      <Cursor
        x={textDims.width + _.cursor.padding.x}
        y={0}
        width={cursorDims.width}
        height={cursorDims.height}/>
    }
  </svg>);
}

export default LeafContent;