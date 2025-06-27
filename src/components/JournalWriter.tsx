'use client';
import React, { useState, useEffect, useRef, KeyboardEventHandler, FocusEventHandler, MouseEventHandler } from 'react';

var nextId = 1;
function getNextId() {
  return nextId++;
}

type pair = {
  key: string,
  value: number,
}

type element = {
  id:number,
  x:number,
  y:number,
  content:string,
  ref?:any,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
  ex:pair[],
}

function Element({id, x, y, content, ref, handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp, ex} : element) {
  const [hasFocus, setFocus] = useState(false);

  if (!content)
    content = "";

  const handleOnFocus = () => setFocus(true);

  const handleOnBlur = () => {
    setFocus(false);
    if (parentOnBlur)
      parentOnBlur();
  };

  return (
    <text x={x} y={y} tabIndex={0} ref={ref}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        whiteSpace: "break-spaces",
        outline: hasFocus ? "3px solid black":"none"
      }}>
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
  id: number,
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number>(-1);
  const [mouseDownY, setMouseDownY] = useState<number>(-1);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, id:-1});
  const elementsRef = useRef<Map<any, any>|null>(null);

  const printState = () => {
    console.log('mouseDownX:' + mouseDownX + ' mouseDownY:' + mouseDownY + ' inputState:' + input.state.text + " numElements:" + elements.length);
  }

  const copyElements = () =>
    elements.map((element) => {
      return {...element,
              ex:element.ex.map((pair:pair) => {
                return {...pair}})};
    });

  function getMap() {
    if (!elementsRef.current)
      elementsRef.current = new Map();

    return elementsRef.current;
  }

  const handleMouseDownElement = (x:number, y:number, e:React.MouseEvent<SVGTextElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    setMouseDownX(x);
    setMouseDownY(y);
    e.stopPropagation();
  }

  const handleMouseUpElement = (x:number, y:number, id:number, e:React.MouseEvent<SVGTextElement, MouseEvent>) => {
    if ((mouseDownX === null) ||
        (mouseDownY === null) ||
        (!e.target))
      return;

    // See if you're still on the text element
    const map = getMap();
    const element = map.get(id);
    const rect = element.getBoundingClientRect();

    if (((x>=rect.x) && (x<=rect.x+rect.width) &&
         (y>= rect.y) && (y<= rect.y+rect.height)) &&
         (input.id !== id))
      setInput({state:INPUT_STATE.WRITING, id:id})

    setMouseDownX(-1);
    setMouseDownY(-1);
    e.stopPropagation();
  }

  const handleMouseDown = (x:number, y:number, e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    setMouseDownX(x);
    setMouseDownY(y);
  }

  const handleMouseUp = (x:number, y:number, e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((mouseDownX === null) ||
        (mouseDownY === null) ||
        (!e.target))
      return;

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const newElements = elements.map((element) => {
        return {...element}});

      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;
      const id = getNextId();

      setElements(newElements.concat({id:id, x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), content:"", ex:[]}));
      setInput({state:INPUT_STATE.WRITING, id:id});
    }

    setMouseDownX(-1);
    setMouseDownY(-1);
  }

  useEffect(() => {
    if (input.state !== INPUT_STATE.WRITING)
      return;

    const map = getMap();
    const element = map.get(input.id);
    element.focus();
  }, [input]);

  const handleOnBlur = (content:string, id:number) => {
    if (content === "")
      setElements(copyElements().filter((element) => element.id !== id));
  }

  const handleKeyDown = (e:React.KeyboardEvent<SVGTextElement>) => {
  }

  const handleKeyUp = (e:React.KeyboardEvent<SVGTextElement>) => {
    if ((e.key === "Shift") ||
        (e.key === "Alt") ||
        (e.key === "Control") ||
        (e.key === "CapsLock"))
      return;

    if ((input.state === INPUT_STATE.WRITING) && (input.id >= 0)) {
      const newElements = copyElements();
      const updatedElement = newElements.find((element) => element.id === input.id);

      if (!updatedElement) return;

      switch (e.key) {
      case "Backspace":
        updatedElement.content = updatedElement.content.slice(0, updatedElement.content.length-1); break;
      case "Enter":
        console.log('lol'); break;
      case "Tab":
        console.log('tab'); break;
      case "Delete":
        setInput({state:INPUT_STATE.FREE, id:-1});
        setElements(newElements.filter((element) => element.id !== input.id));
        return;
      case " ":
        updatedElement.content = updatedElement.content + " ";
        console.log('here');
        console.log(updatedElement.content + "END");
        break;
      default:
        updatedElement.content += e.key;
      }

      setElements(newElements);
    }
  }

  const ref = (id:number, node:any) => {
    if (!node) return () => {};

    const map = getMap();
    map.set(id, node);

    return () => {
      map.delete(id);
    };
  };

  return (
    <svg className="bg-rose-50 w-screen h-screen cursor-default"
         onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e.clientX, e.clientY, e)}
         onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e.clientX, e.clientY, e)}>
      {elements.map((element) =>
        <Element id={element.id} x={element.x} y={element.y} content={element.content} key={element.id} ex={element.ex}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e.clientX, e.clientY, e)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e.clientX, e.clientY, element.id, e)}
          parentOnBlur={handleOnBlur.bind(null, element.content, element.id)}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}
          ref={ref.bind(null, element.id)}/>
      )}
    </svg>
  );
}
