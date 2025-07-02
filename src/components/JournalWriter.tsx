'use client';
import React, { useState, useEffect, useRef, KeyboardEventHandler, MouseEventHandler } from 'react';

//
// returns a list of all elements under the cursor
//
function elementsFromPoint(x:number,y:number,stop:string) {
	var elements = [], previousPointerEvents = [], current, i, d;

  // get all elements via elementFromPoint, and remove them from hit-testing in order
	while ((current = document.elementFromPoint(x,y) as HTMLElement) && elements.indexOf(current)===-1 && current != null) {
    // check if we are done searching
    if(current.nodeName === stop)
      break;

    // push the element and its current style
		elements.push(current);
		previousPointerEvents.push({
      value: current.style.getPropertyValue('pointer-events'),
      priority: current.style.getPropertyPriority('pointer-events')});
          
    // add "pointer-events: none", to get to the underlying element
		current.style.setProperty('pointer-events', 'none', 'important'); 
	}

  // restore the previous pointer-events values
	for(i = previousPointerEvents.length; d=previousPointerEvents[--i]; )
		elements[i].style.setProperty('pointer-events', d.value?d.value:'', d.priority); 
      
  // return our results
	return elements;
}

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

const REGION = {
  TOP_LEFT_CORNER: {'text':'Top Left Corner'},
  TOP_RIGHT_CORNER: {'text':'Top Right Corner'},
  BOTTOM_LEFT_CORNER: {'text':'Bottom Left Corner'},
  BOTTOM_RIGHT_CORNER: {'text':'Bottom Right Corner'},
  TOP_SIDE: {'text':'Top Side'},
  BOTTOM_SIDE: {'text':'Bottom Side'},
  LEFT_SIDE: {'text':'Left Side'},
  RIGHT_SIDE: {'text':'Right Side'},
  BODY: {'text':'Body'},
  NONE: {'text': 'None'},
}

type pEnum = {
  text:string,
}

type hover = {
  id:number,
  region:pEnum,
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
  const [mouseDownX, setMouseDownX] = useState<number>(-1);
  const [mouseDownY, setMouseDownY] = useState<number>(-1);
  const [elements, setElements] = useState<element[]>([]);
  const [hover, setHover] = useState<hover>({id:-1, region:REGION.NONE});
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, id:-1});
  const [drag, setDrag] = useState<drag>(dragDefault);
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

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);
    setDrag({active:true, id:id});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, id:number) => {
    e.stopPropagation();

    if ((mouseDownX === -1) ||
        (mouseDownY === -1) ||
        (drag.id !== id) ||
        (!e.target))
      return;

    if (input.id === id) {
      // Since this element is already selected, look underneath it for other text that could be edited.

    }

    // See if you're still on the text element
    const rect = getMap().get(id).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (((x>=rect.x) && (x<=rect.x+rect.width) &&
         (y>=rect.y) && (y<=rect.y+rect.height)))
      setInput({state:INPUT_STATE.WRITING, id:id});

    setMouseDownX(-1);
    setMouseDownY(-1);
    setDrag(dragDefault);
  }

  const within = (left:number, right:number, value:number) => ((value>=left) && (value<=right))

  const DEFAULT_GRAB_PADDING = 5;
  const getRegion = (x:number,y:number,rect:any) => {
    let bottom = rect.y+rect.height;
    let right = rect.x+rect.width;

    if (within(rect.x, rect.x+DEFAULT_GRAB_PADDING, x)) {
      if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
        return REGION.TOP_LEFT_CORNER;
      if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
        return REGION.BOTTOM_LEFT_CORNER;
      return REGION.LEFT_SIDE;
    }

    if (within(right-DEFAULT_GRAB_PADDING, right, x)) { // Right Side
      if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
        return REGION.TOP_RIGHT_CORNER;
      if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
        return REGION.BOTTOM_RIGHT_CORNER;
      return REGION.RIGHT_SIDE;
    }

    if (within(rect.y, rect.y+DEFAULT_GRAB_PADDING, y))
      return REGION.TOP_SIDE;
    if (within(bottom-DEFAULT_GRAB_PADDING, bottom, y))
      return REGION.BOTTOM_SIDE;

    return REGION.BODY;
  };

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (e.button !== 0)
      return;

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((mouseDownX === -1) ||
        (mouseDownY === -1) ||
        (!e.target))
      return;

    let x = e.clientX;
    let y = e.clientY;

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const newElements = copyElements();
      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;
      const id = getNextId();

      setElements(newElements.concat({id:id, x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), content:"", ex:[]}));
      setInput({state:INPUT_STATE.WRITING, id:id});
    }

    setMouseDownX(-1);
    setMouseDownY(-1);
  }

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    const domElements = elementsFromPoint(x, y, "svg");
    /*const newHoveredElements = [...hoveredElements];
    const map = getMap();
    
    // First check if domElements still has any hoveredElements
    Array.from(map, ([key, value]) => {
      if (domElements.includes(value)) {
        console.log('included', value);
      }
    });*/
    if (domElements.length === 0) {
      setHover({id:-1, region:REGION.NONE});
      return;
    }

    const domElement = domElements[0];
    const map = getMap();
    var id = -1;
    Array.from(map, ([key, value]) => {
      if (domElement === value)
        id = key;
    });
    setHover({id:id, region:getRegion(x, y, domElement.getBoundingClientRect())});
  }

  useEffect(() => {
    if (input.state !== INPUT_STATE.WRITING)
      return;

    getMap().get(input.id).focus();
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
        (e.key === "ArrowUp") ||
        (e.key === "ArrowDown") ||
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
    <svg className="bg-rose-50 w-screen h-screen"
         onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e)}
         onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e)}
         onMouseMove={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseMove(e)}
         style={{
          cursor: (hover.region === REGION.NONE) ? "default" :
                  (hover.region === REGION.BODY) ? "text" : "crosshair"
         }}>
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
