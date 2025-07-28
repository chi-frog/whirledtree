'use client'

import CanvasInput from "./CanvasInput"

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  fontSize:number,
  font:string,
  notifyFontChange:Function,
  fonts:string[],
  textWidth:number,
}

export default function CanvasOptions({id, x, y, fontSize, font, notifyFontChange, fonts, textWidth} : elementInputProps) {
  return (
    <CanvasInput
      id={id}
      x={x}
      y={y}
      fontSize={fontSize}
      font={font}
      notifyFontChange={notifyFontChange}
      fonts={fonts}
      textWidth={textWidth}/>
  )
}
