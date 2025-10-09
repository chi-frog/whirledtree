'use client'

import { calcFontDims, Dimension, Font } from '@/hooks/useFonts';
import * as React from 'react';
import { MouseEventHandler } from 'react';

type Props = {
  x:number,
  y:number,
  width?:number,
  height?:number,
  overflow?:string,
  padding?:{x:number, y:number},
  cornerRadiusX?:number,
  cornerRadiusY?:number,
  cornerRadiusPercentage?:number,
  text?:string,
  dims?:Dimension,
  font:Font,
  onMouseEnter?:MouseEventHandler<SVGRectElement>,
  onMouseLeave?:MouseEventHandler<SVGRectElement>,
  onMouseDown?:MouseEventHandler<SVGRectElement>,
  children?:React.ReactNode,
};
const TextBox: React.FC<Props> = ({
    x, y, width, height, overflow, padding,
    cornerRadiusX, cornerRadiusY, cornerRadiusPercentage,
    text, dims, font,
    onMouseEnter, onMouseLeave, onMouseDown,
    children}) => {

  if (!padding) padding = {x:0, y:0};
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

  const textOffsetX =
    (overflow === 'cut' && ((dims.width + padding.x) > width)) ? padding.x :
    width/2 - dims.width/2;
  const textOffsetY =
    height/2 + dims.height/2 - dims.textHeightGap;

  if (overflow === 'cut' && (dims.width + padding.x) > width) {
    
  }

  return (
    <svg x={x - 1} y={y - 1} width={width + 2} height={height + 2}>
      <rect
        x={1}
        y={1}
        className="hover:fill-gray-200 hover:cursor-pointer hover:stroke-yellow-600"
        width={width}
        height={height}
        rx={(cornerRadiusPercentage) ? (dims.height*cornerRadiusPercentage) :
            (cornerRadiusX) ? cornerRadiusX :
            (cornerRadiusY) ? cornerRadiusY : 0
        }
        ry={(cornerRadiusPercentage) ? (dims.height*cornerRadiusPercentage) :
            (cornerRadiusY) ? cornerRadiusY :
            (cornerRadiusX) ? cornerRadiusX : 0
        }
        stroke={"white"}
        fill={'white'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}/>
      <text
        className="cursor-pointer"
        x={1 + textOffsetX}
        y={1 + textOffsetY}
        fontSize={font.size}
        style={{
          fontFamily:font.name,
          pointerEvents:'none'
        }}>
        {text}
        {children}
      </text>
    </svg>
  )
}

export default TextBox;