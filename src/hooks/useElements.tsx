'use client'

import { element } from "@/components/Element";
import { useState } from "react";

function useElements() {
  const [elements, setElements] = useState<element[]>([]);
  
  const createElement = (x:number, y:number, content:string, font:string, fontSize:number) => {   
    const newElement = {
      id:Date.now() - x*100 - y*10000,
      x:x,
      y:y,
      font:font,
      fontSize:fontSize,
      content:content,
      optionsFocused:false,};
      
    setElements((_elements:element[]) => _elements.concat(newElement));
  }
}