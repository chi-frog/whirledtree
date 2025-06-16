'use client';
import React, { useState, useEffect, useRef } from 'react';

type exPair = {
  key: string,
  value: number[],
}

type element = {
  x:number,
  y:number,
  content:string,
  ex?:exPair[],
}

function Element({x, y, content, ex} : element) {
  if (!content)
    content = "";

  return (
    <text x={x} y={y}>
      {content}
    </text>
  );
}

type pEnum = {
  text:string,
}

const INPUT_STATE = {
  FREE: {text: 'free'},
  WRITING: {text: 'writing'},
}

type input = {
  state:pEnum,
  index: number|null,
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number|null>(null);
  const [mouseDownY, setMouseDownY] = useState<number|null>(null);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, index:null});

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + input.state.text + " numElements:" + elements.length);
  }

  const handleMouseDown = (x:number, y:number, e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    const target = e.target as Element;

    console.log('e mousedown', e);

    if (target && target.nodeName !== "TEXT") {
      setMouseDownX(x);
      setMouseDownY(y);
    }
  }

  const handleMouseUp = (x:number, y:number) => {
    if ((mouseDownX === null) ||
        (mouseDownY === null))
      return;

    let distance = Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2));

    if (distance <= 5) {
      const newElements = elements.map((element) => {
        return {...element}});

      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;

      const top = y - DEFAULT_OFFSET_Y;
      const left = x - DEFAULT_OFFSET_X;
      const index = newElements.length;

      const newElement = {x:left, y:top, content:""};
      const newInput = {state:INPUT_STATE.WRITING, index:index};

      setElements(newElements.concat(newElement));
      setInput(newInput);
      
      console.log('new element created');
    }

    setMouseDownX(null);
    setMouseDownY(null);
  }

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
  }

  const handleKeyUp = (e:React.KeyboardEvent<SVGSVGElement>) => {
    if ((e.key === "Shift"))
      return;

    if ((input.state === INPUT_STATE.WRITING) && (input.index)) {
      const newElements = elements.map((element) => {
        return {...element}});
      const newContent = newElements[input.index].content;

      if (e.key === "Backspace")
        newElements[input.index].content = newContent.slice(0, newContent.length-1);

      setElements(newElements);
    }
  }

  const handleBlur = () => {
  }

  const autoFocus = (element:any) => {
    element?.focus();

    return () => {
      // Clean up
    }
  }

  return (
    <svg className="bg-rose-50 w-screen h-screen cursor-default" ref={autoFocus} tabIndex={-1}
         onBlur={(e) => handleBlur()}
         onMouseDown={(e) => handleMouseDown(e.clientX, e.clientY, e)}
         onMouseUp={(e) => handleMouseUp(e.clientX, e.clientY)}
         onKeyDown={(e) => handleKeyDown(e)}
         onKeyUp={(e) => handleKeyUp(e)}>
      {elements.map((element, index) =>
        (index != input.index) ?
          <Element x={element.x} y={element.y} content={element.content} key={index}/> :
          <Element x={element.x} y={element.y} content={input.current} key={index}/>
      )}
    </svg>
  );
}
