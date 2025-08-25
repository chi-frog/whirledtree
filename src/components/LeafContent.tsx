'use client'

import { Leaf } from "@/hooks/useLeaves";
import { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import Cursor from "./Cursor";
import { Dimension } from "@/hooks/useFont";
import TextBox from "./svg/TextBox";

const _ = {
  cursor: {
    padding: {
      x:2,
      y:2,
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

  const dims = (textDims.height) ? textDims : cursorDims;

  const svgY = leaf.y - dims.textHeight - dims.textHeightGap- _.text.padding.y;
  const svgWidth = textDims.width + cursorDims.width + _.cursor.padding.x*2;
  const svgHeight = dims.height + _.text.padding.y*2;

  return (<svg
      x={leaf.x}
      y={svgY}
      width={svgWidth}
      height={svgHeight}>
    <rect
      width={svgWidth}
      height={svgHeight}
      rx={5}
      fill={(focused) ? 'rgba(211, 175, 55, 0.1)' : (selected) ? 'rgba(0, 255, 0, 0.1)' : 'none'}
      stroke={(focused) ? 'rgba(211, 175, 55, 0.5)' : (selected) ? 'rgba(0, 255, 0, 0.5)' : 'none'}
    />
    <text
      x={_.cursor.padding.x}
      y={leaf.y - svgY}
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
        userSelect: "none",
        outline: "none",
      }}>
      <tspan data-elementid={leaf.id} style={{
          whiteSpace: "break-spaces"
        }}>
        {leaf.content}
      </tspan>
    </text>
    {focused &&
      <Cursor
        x={textDims.width + _.cursor.padding.x}
        y={_.cursor.padding.y}
        width={cursorDims.width}
        height={dims.height}/>
    }
  </svg>);
}

export default LeafContent;