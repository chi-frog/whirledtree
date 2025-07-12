import { KeyboardEventHandler, MouseEventHandler } from "react";

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  width:number,
  height:number,
  fontSize:number,
  elementFontSize:number,
  hasFocus:boolean,
}

type elementProps = {
  ref?:any,
  map?:any,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

export default function ElementInput({id, x, y, width, height, fontSize, elementFontSize, hasFocus} : elementInputProps) {
  return (
    <>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="white">
    </rect>
    <text
      x={x}
      y={y+20}
      fontSize={fontSize}>
      {""+elementFontSize}
    </text>
    </>
  );
}