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
        outline: hasFocus ? "3px solid black":"none",
        userSelect: "none",
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

type drag = {
  active: boolean,
  id: number,
}
const dragDefault = {
  active:false,
  id:-1,
}

export default function JournalWriter() {
  const [mouseX, setMouseX] = useState<number>(-1);
  const [mouseY, setMouseY] = useState<number>(-1);
  const [drag, setDrag] = useState<drag>(dragDefault);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, id:-1});
  const elementsRef = useRef<Map<any, any>|null>(null);

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

  const handleMouseDownElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, id:number) => {
    e.stopPropagation();

    if (e.button !== 0)
      return;

    setMouseX(e.clientX);
    setMouseY(e.clientY);
    setDrag({active:true, id:id});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, id:number) => {
    e.stopPropagation();

    if ((!mouseX) ||
        (!mouseY) ||
        (drag.id !== id) ||
        (input.id === id) ||
        (!e.target))
      return;

    // See if you're still on the text element
    const element = getMap().get(id);
    const rect = element.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (((x>=rect.x) && (x<=rect.x+rect.width) &&
         (y>= rect.y) && (y<= rect.y+rect.height)))
      setInput({state:INPUT_STATE.WRITING, id:id});

    setMouseX(-1);
    setMouseY(-1);
    setDrag(dragDefault);
  }

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    setMouseX(e.clientX);
    setMouseY(e.clientY);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((mouseX === null) ||
        (mouseY === null) ||
        (!e.target))
      return;

    let x = e.clientX;
    let y = e.clientY;

    if (Math.sqrt(Math.pow(y-mouseY, 2) + Math.pow(x-mouseX, 2)) <= 5) {
      const newElements = elements.map((element) => {
        return {...element}});

      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;
      const id = getNextId();

      setElements(newElements.concat({id:id, x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), content:"", ex:[]}));
      setInput({state:INPUT_STATE.WRITING, id:id});
    }

    setMouseX(-1);
    setMouseY(-1);
  }

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    //console.log('moved to (' + e.clientX + "," + e.clientY);
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
        (e.key === "ArrowRight") ||
        (e.key === "ArrowLeft") ||
        (e.key === "CapsLock"))
      return;

    e.preventDefault();

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
         onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e)}
         onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e)}
         onMouseMove={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseMove(e)}>
      {elements.map((element) =>
        <Element id={element.id} x={element.x} y={element.y} content={element.content} key={element.id} ex={element.ex}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e, element.id)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e, element.id)}
          parentOnBlur={handleOnBlur.bind(null, element.content, element.id)}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}
          ref={ref.bind(null, element.id)}/>
      )}
    </svg>
  );
}
