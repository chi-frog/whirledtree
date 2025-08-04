'use client'

import { useState } from "react";

export type element = {
  id:number,
  x:number,
  y:number,
  font:string,
  fontSize:number,
  content:string,
  optionsFocused:boolean,
}

function useElements() {
  const [elements, setElements] = useState<element[]>([]);
  
  const createElement = ({x, y, font, fontSize, content=""} :
                         {x:number, y:number, font:string, fontSize:number, content:string}) => {
    const id = Date.now();
    const newElement = {
      id:id,
      x:x,
      y:y,
      font:font,
      fontSize:fontSize,
      content:content,
      optionsFocused:false,};
      
    setElements((_elements:element[]) => _elements.concat(newElement));

    return id;
  }

  return {elements, createElement, setElements}
}

export default useElements;