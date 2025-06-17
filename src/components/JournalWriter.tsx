'use client';
import React, { useState, useEffect, useRef, KeyboardEventHandler } from 'react';

type exPair = {
  key: string,
  value: number[],
}

type element = {
  x:number,
  y:number,
  content:string,
  ref?:any,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
  ex?:exPair[],
}

function Element({x, y, content, ref, handleKeyDown, handleKeyUp, ex} : element) {
  if (!content)
    content = "";

  return (
    <text x={x} y={y} tabIndex={0} ref={ref}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}>
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
  index: number,
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number>(-1);
  const [mouseDownY, setMouseDownY] = useState<number>(-1);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, index:-1});
  const elementsRef = useRef<Map<any, any>|null>(null);

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + input.state.text + " numElements:" + elements.length);
  }

  function getMap() {
    if (!elementsRef.current) {
      // Initialize the Map on first usage.
      elementsRef.current = new Map();
    }
    return elementsRef.current;
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

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const newElements = elements.map((element) => {
        return {...element}});

      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;

      const newElement = {x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), content:""};
      const newInput = {state:INPUT_STATE.WRITING, index:newElements.length};

      setElements(newElements.concat(newElement));
      setInput(newInput);
    }

    setMouseDownX(-1);
    setMouseDownY(-1);
  }

  useEffect(() => {
    if (input.state !== INPUT_STATE.WRITING)
      return;

    const map = getMap();
    const element = map.get(input.index);
    element.focus();
  }, [input]);

  const handleKeyDown = (e:React.KeyboardEvent<SVGTextElement>) => {
  }

  const handleKeyUp = (e:React.KeyboardEvent<SVGTextElement>) => {

    console.log('up', e);
    if ((e.key === "Shift"))
      return;

    if ((input.state === INPUT_STATE.WRITING) && (input.index >= 0)) {
      const newElements = elements.map((element) => {
        return {...element}});
      const newContent = newElements[input.index].content;

      if (e.key === "Backspace")
        newElements[input.index].content = newContent.slice(0, newContent.length-1);
      else
        newElements[input.index].content = newContent + e.key;

      setElements(newElements);
    }
  }

  const ref = (index:number, node:any) => {
    if (!node) return () => {};

    const map = getMap();
    map.set(index, node);

    return () => {
      map.delete(index);
    };
  };

  return (
    <svg className="bg-rose-50 w-screen h-screen cursor-default"
         onMouseDown={(e) => handleMouseDown(e.clientX, e.clientY, e)}
         onMouseUp={(e) => handleMouseUp(e.clientX, e.clientY)}>
      {elements.map((element, index) =>
        <Element x={element.x} y={element.y} content={element.content} key={index}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}
          ref={ref.bind(null, index)}/>
      )}
    </svg>
  );
}
