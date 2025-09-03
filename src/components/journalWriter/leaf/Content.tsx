'use client'

import { Leaf } from "@/hooks/useLeaves";
import { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import Cursor from "../Cursor";
import { Dimension } from "@/hooks/useFont";
import TextBox from "../svg/TextBox";

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
  let svgWidth = textDims.width + cursorDims.width + _.cursor.padding.x*2;
  if (selected && !focused) svgWidth -= cursorDims.width;
  const svgHeight = dims.height + _.text.padding.y*2;

  return (<svg
      x={leaf.x}
      y={svgY}
      width={svgWidth}
      height={svgHeight}>
    <defs>
        <filter id="shadow" x="-20" y="-20" height="150" width="150">
            <feOffset result="offset" in="SourceAlpha" dx="-10" dy="-10" />
            <feGaussianBlur result="blur" in="offset" stdDeviation="5" />
            <feBlend in="SourceGraphic" in2="blur" mode="normal" />
        </filter>
        <linearGradient id="focusedGrad">
          <stop offset="80%" stopColor="rgba(211, 175, 55, 0)"/>
          <stop offset="100%" stopColor="rgba(211, 175, 55, 0.2)"/>
        </linearGradient>
    </defs>
    <rect
      width={svgWidth}
      height={svgHeight}
      rx={5}
      filter='url(#shadow)'
      fill={(focused) ? 'url(#focusedGrad)' : (selected) ? 'rgba(0, 255, 0, 0.1)' : 'none'}
      //stroke={(focused) ? 'rgba(211, 175, 55, 0.5)' : (selected) ? 'rgba(0, 255, 0, 0.5)' : 'none'}
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