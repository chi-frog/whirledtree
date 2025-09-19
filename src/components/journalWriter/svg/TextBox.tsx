'use client'

import { calcFontDims, Dimension, Font } from '@/hooks/useFonts';
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
  onMouseDown?:MouseEventHandler<SVGRectElement>,
  children?:React.ReactNode,
};
const TextBox: React.FC<Props> = ({
    x, y, width, height, padding,
    cornerRadiusX, cornerRadiusY, cornerRadiusPercentage,
    text, dims, font,
    onMouseDown, children}) => {

  if (!text) text = "";    
  if (!dims) {
    let content = text;

    if (Array.isArray(children)) {
      children.forEach((_child) => {
        content += _child.props.children;
      });
    }

    dims = calcFontDims(content, font);
  }

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
        fontSize={font.size}
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