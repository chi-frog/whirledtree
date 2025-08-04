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

  const bringToFront = (id:number) => {
    setElements((_newElements:element[]) => {
      const elementToRemoveIndex = _newElements.findIndex((_element:element) => (_element.id === id));
      const elementToRemove = _newElements.splice(elementToRemoveIndex, 1)[0];
      _newElements.push(elementToRemove);
    
      return _newElements;});
  };

  return {elements, createElement, bringToFront, setElements}
}

export default useElements;