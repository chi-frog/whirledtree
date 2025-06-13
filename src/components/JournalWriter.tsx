'use client';
import React, { useState, useEffect, useRef } from 'react';

function Element({x, y} : {x:number, y:number}) {
  const [content, setContent] = useState<string>("hi");

  return (
    <text x={x} y={y}>
      HI
    </text>
  );
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number|null>(null);
  const [mouseDownY, setMouseDownY] = useState<number|null>(null);
  const [elements, setElements] = useState<any[]>([]);

  const INPUT_STATE = {
    FREE: {text: 'free'},
    WRITING: {text: 'writing'},
  }
  const [inputState, setInputState] = useState(INPUT_STATE.FREE);
  const [currentInput, setCurrentInput] = useState<string>("hi");
  const [focusedElementIndex, setFocusedElementIndex] = useState<number|null>(null);

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + inputState.text + " numElements:" + elements.length);
  }

  const handleMouseDown = (x:number, y:number, e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    console.log('handleMouseDown at (' + x + ',' + y + ') with button ' + e.button);
    printState();

    if (e.button !== 0) {
      return;
    }

    const target = e.target as Element

    if (target && target.nodeName !== "TEXT") {
      setMouseDownX(x);
      setMouseDownY(y);
    }
  }

  const handleMouseUp = (x:number, y:number) => {
    console.log('handleMouseUp at (' + x + ',' + y + ')');
    printState();

    if ((mouseDownX === null) ||
        (mouseDownY === null)) {
      console.log('mouseDownX or mouseDownY was null');
      return;
    }

    let distance = Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2));

    if (distance <= 5) {
      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;

      const top = y - DEFAULT_OFFSET_Y;
      const left = x - DEFAULT_OFFSET_X;
      const index = elements.length;

      const element = <Element x={left} y={top} key={index}/>

      setElements(elements.concat(element));
      setInputState(INPUT_STATE.WRITING);
      setFocusedElementIndex(index);
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
      {...elements}
    </svg>
  );
}
