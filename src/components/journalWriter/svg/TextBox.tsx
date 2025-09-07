'use client'

import { Dimension, Font, FontTb } from '@/hooks/useFont';
import * as React from 'react';
import { MouseEventHandler } from 'react';

type Props = {
  x:number,
  y:number,
  width?:number,
  height?:number,
  padding:{x:number, y:number},
  cornerRadiusX?:number,
  cornerRadiusY?:number,
  cornerRadiusPercentage?:number,
  text?:string,
  dims?:Dimension,
  font:Font,
  fontSize?:number,
  fontTb?:FontTb,
  onMouseDown?:MouseEventHandler<SVGRectElement>,
  children?:React.ReactNode,
};
const TextBox: React.FC<Props> = ({
    x, y, width, height, padding,
    cornerRadiusX, cornerRadiusY, cornerRadiusPercentage,
    text, dims, font, fontSize, fontTb,
    onMouseDown, children}) => {

  if (!text) text = "";    
  if (!dims && fontTb && fontSize) {
    let content = text;

    if (Array.isArray(children)) {
      children.forEach((_child) => {
        content += _child.props.children;
      });
    }

    dims = fontTb.getDims(content, font, fontSize);
  } else if (!dims)
    dims = {width:0, height:0, textHeight:0, textHeightGap:0}

  if (!width) width = dims.width;
  if (!height) height = dims.height;

  return (
    <>
      <rect
        className="hover:fill-gray-200 hover:cursor-pointer hover:stroke-yellow-600"
        x={x}
        y={y}
        width={width + padding.x*2}
        height={height + padding.y*2}
        rx={(cornerRadiusPercentage) ? (dims.width*cornerRadiusPercentage) :
            (cornerRadiusX) ? cornerRadiusX :
            (cornerRadiusY) ? cornerRadiusY : 0
        }
        ry={(cornerRadiusPercentage) ? (dims.height*cornerRadiusPercentage) :
            (cornerRadiusY) ? cornerRadiusY :
            (cornerRadiusX) ? cornerRadiusX : 0
        }
        stroke={"none"}
        fill={'white'}
        onMouseDown={onMouseDown}/>
      <text
        className="cursor-pointer"
        x={x + (width + padding.x*2)/2 - dims.width/2}
        y={y + (height + padding.y*2)/2 + dims.height/2 - dims.textHeightGap}
        fontSize={fontSize}
        style={{
          fontFamily:font.name,
          pointerEvents:'none'
        }}>
        {text}
        {children}
      </text>
    </>
  )
}

export default TextBox;