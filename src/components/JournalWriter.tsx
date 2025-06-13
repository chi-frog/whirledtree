'use client';
import React, { useState, useEffect, useRef } from 'react';

type keyValuePair = {
  key: string,
  value: unknown,
}

type element = {
  x:number,
  y:number,
  content?:string,
  props?:keyValuePair[],
}

function Element({x, y, content, props} : element) {
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
  current:string,
  index: number|null,
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number|null>(null);
  const [mouseDownY, setMouseDownY] = useState<number|null>(null);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, current:"", index:null});

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + input.state.text + " numElements:" + elements.length);
  }

  const handleMouseDown = (x:number, y:number, e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    const target = e.target as Element;

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
      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;

      const top = y - DEFAULT_OFFSET_Y;
      const left = x - DEFAULT_OFFSET_X;
      const index = elements.length;

      const element = {x:left, y:top, contents:""};

      setElements(elements.concat(element));

      const newInput = {...input, state:INPUT_STATE.WRITING, index:index};

      setInput(newInput);
    }

    setMouseDownX(null);
    setMouseDownY(null);
  }

  const handleKeyDown = (e:React.KeyboardEvent<SVGSVGElement>) => {
    console.log('handleKeyDown');
    console.log('e', e);
  }

  const handleKeyUp = (e:React.KeyboardEvent<SVGSVGElement>) => {
    console.log('handleKeyUp');
    console.log('e', e);

    if (e.key === "Shift")
      return;

    const newInput = {...input, current:input.current + e.key};

    setInput(newInput);
  }

  const autoFocus = (element:any) => {
    console.log('autoFocus');
    element?.focus();

    return () => {
      console.log('Clean up', element);
    }
  }

  return (
    <svg className="bg-rose-50 w-screen h-screen cursor-default" ref={autoFocus} tabIndex={-1}
         onMouseDown={(e) => handleMouseDown(e.clientX, e.clientY, e)}
         onMouseUp={(e) => handleMouseUp(e.clientX, e.clientY)}
         onKeyDown={(e) => handleKeyDown(e)}
         onKeyUp={(e) => handleKeyUp(e)}>
      {elements.map((element, index) => {
        if (index != input.index)
          return <Element x={element.x} y={element.y} content={element.content} key={index}/>
        else
          return <Element x={element.x} y={element.y} content={input.current} key={index}/>
      })}
    </svg>
  );
}
