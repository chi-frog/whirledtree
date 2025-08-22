'use client'

import { Dimension, Font, FontTb } from '@/hooks/useFont';
import * as React from 'react';
import { MouseEventHandler } from 'react';

type Props = {
  x:number,
  y:number,
  height?:number,
  padding:{x:number, y:number},
  cornerRadiusX?:number,
  cornerRadiusY?:number,
  cornerRadiusPercentage?:number,
  text:string,
  dims?:Dimension,
  font:Font,
  fontSize?:number,
  fontTb?:FontTb,
  onMouseDown?:MouseEventHandler<SVGRectElement>,
};
const TextBox: React.FC<Props> = ({
    x, y, height, padding,
    cornerRadiusX, cornerRadiusY, cornerRadiusPercentage,
    text, dims, font, fontSize, fontTb,
    onMouseDown}) => {
  if (!dims && fontTb && fontSize)
    dims = fontTb.getDims(text, font, fontSize);
  else
    dims = {width:0, height:0, textHeight:0, textHeightGap:0}

  if (!height) height = dims.height;

  return (
    <>
      <rect
        className="hover:fill-gray-200 hover:cursor-pointer hover:stroke-yellow-600"
        x={x}
        y={y}
        width={dims.width + padding.x*2}
        height={height + padding.y*2}
        rx={(cornerRadiusPercentage) ? (dims.width*cornerRadiusPercentage) :
            (cornerRadiusX) ? cornerRadiusX : 0
        }
        ry={(cornerRadiusPercentage) ? (dims.height*cornerRadiusPercentage) :
            (cornerRadiusY) ? cornerRadiusY : 0
        }
        stroke={"black"}
        fill={'white'}
        onMouseDown={onMouseDown}/>
      <text
        className="cursor-pointer"
        x={x + (dims.width + padding.x*2)/2 - dims.width/2}
        y={y + (dims.height + padding.y*2)/2 + dims.height/2 - dims.textHeightGap}
        fontSize={fontSize}
        style={{
          pointerEvents:'none',
          fontFamily:font.name,
        }}>
        {text}
      </text>
    </>
  )
}

export default TextBox;