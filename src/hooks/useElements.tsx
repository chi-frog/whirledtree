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

export type tbElement = {
  setElements:Function,
  createElement:Function,
  updateElement:Function,
  updateElementField:Function,
  deleteElement:Function,
  bringToFront:Function,
  transformContent:Function,
}

function useElements() {
  const [elements, setElements] = useState<element[]>([]);
  
  const createElement = ({x, y, font, fontSize, content=""} :
                         {x:number, y:number, font:string, fontSize:number, content:string}) => {
    const id = Date.now();
      
    setElements((_elements:element[]) => _elements.concat({
      id:id,
      x:x,
      y:y,
      font:font,
      fontSize:fontSize,
      content:content,
      optionsFocused:false,}));

    return id;
  }

  const updateElement = (id:number, callback:(_element:element)=>element) =>
    setElements((_elements) => 
      _elements.map((_element) =>
        (_element.id === id) ?
          (callback(_element)) :
          (_element)));

  const updateElementField = <K extends keyof element>
    (id: number, key: K, callback: (prev: element[K]) => element[K]) =>
    setElements((_elements) =>
      _elements.map((_element) =>
        (_element.id === id)
          ? {..._element,
            [key]: callback(_element[key]),}
          : _element));

  const deleteElement = (id:number) =>
    setElements((_elements) =>
      _elements.filter((_element) =>
        (_element.id !== id)));

  const bringToFront = (id:number) =>
    setElements((_newElements:element[]) => {
      const elementToRemoveIndex = _newElements.findIndex((_element:element) => (_element.id === id));
      const elementToRemove = _newElements.splice(elementToRemoveIndex, 1)[0];
      _newElements.push(elementToRemove);
    
      return _newElements;});

  const transformContent = (id:number, callback:Function) =>
    setElements((_elements) => 
      _elements.map((_element) =>
        (_element.id === id) ?
          {..._element,
           content: callback(_element.content)} :
          (_element)));

  const tbElements = {
    setElements,
    createElement,
    updateElement,
    updateElementField,
    deleteElement,
    bringToFront,
    transformContent,
  }

  return {elements, tbElements}
}

export default useElements;