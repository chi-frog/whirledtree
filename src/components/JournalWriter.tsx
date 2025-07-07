'use client';
import React, { useState, useEffect, useRef, KeyboardEventHandler, MouseEventHandler } from 'react';

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`)
  }
}

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

var nextId = Date.now();
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
  fontSize:number,
  content:string,
  mouseoverRegion:pEnum,
  isDragged:boolean,
  hasFocus:boolean,
  ex:pair[],
}

type elementProps = {
  element:element,
  ref?:any,
  self?:any,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

function Element({element, ref, self, handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : elementProps) {
  const optionsOffsetY = useRef(self ? self.getBBox().height : element.fontSize);

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseEnter = (e:React.MouseEvent<SVGCircleElement>) => {
console.log('handleMouseEnter', e);
  };

  const handleMouseLeave = (e:React.MouseEvent<SVGCircleElement>) => {
console.log('handleMouseLeave', e);
  };

  return (
    <>   
    <text x={element.x} y={element.y} tabIndex={0} ref={ref}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        whiteSpace: "break-spaces",
        fontSize: element.fontSize,
        outline: element.hasFocus ? "1px solid gold" : "none",
        userSelect: "none",
        cursor: (element.hasFocus) ? "text" :
                (element.isDragged) ? "grabbing" :
                (element.mouseoverRegion === REGION.NONE) ? "default" :
                ((element.mouseoverRegion === REGION.LEFT_SIDE) || element.mouseoverRegion === REGION.RIGHT_SIDE) ? "ew-resize" :
                ((element.mouseoverRegion === REGION.TOP_SIDE) || element.mouseoverRegion === REGION.BOTTOM_SIDE) ? "ns-resize" :
                ((element.mouseoverRegion === REGION.TOP_RIGHT_CORNER) || (element.mouseoverRegion === REGION.BOTTOM_LEFT_CORNER)) ? "sw-resize" :
                ((element.mouseoverRegion === REGION.TOP_LEFT_CORNER) || (element.mouseoverRegion === REGION.BOTTOM_RIGHT_CORNER)) ? "nw-resize" :
                (element.mouseoverRegion === REGION.BODY) ? "grab" : "default"
      }}>
      {element.content}
    </text>
    {element.hasFocus &&
    <circle cx={element.x-7} cy={element.y-optionsOffsetY.current} r={5} fill="lightblue" fillOpacity="0.7" stroke="blue" strokeWidth="2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: "none",
      }}/>}
    </>
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

const INPUT_STATE = {
  FREE: {text: 'free'},
  WRITING: {text: 'writing'},
}

type input = {
  state:pEnum,
  id: number,
}

const inputDefault = {
  state:INPUT_STATE.FREE,
  id:-1,
}

type drag = {
  active: boolean,
  id: number,
  region: pEnum,
  offsetX:number,
  offsetY:number,
}
const dragDefault = {
  active:false,
  id:-1,
  region:REGION.NONE,
  offsetX:0,
  offsetY:0
}

export default function JournalWriter() {
  const [mouseDownX, setMouseDownX] = useState<number>(-1);
  const [mouseDownY, setMouseDownY] = useState<number>(-1);
  const [elements, setElements] = useState<element[]>([]);
  const [input, setInput] = useState<input>({state:INPUT_STATE.FREE, id:-1});
  const [drag, setDrag] = useState<drag>(dragDefault);
  const elementsRef = useRef<Map<any, any>|null>(null);
  const savedUpperCaseLetters = useRef<string[]>([]);

  const copyElements = () => elements.map((element) => {
      return {...element,
              ex:element.ex.map((pair:pair) => {
                return {...pair}})}});

  const targetCopyElements = (...funcs:Function[]) : [element[], element] | [element[], element, element] => {
    const newElements = copyElements();
    const ret:any = [newElements];

    funcs.forEach ((func) => ret.push(newElements.find((element) => func(element))));

    return ret;
  }

  function getMap() {
    if (!elementsRef.current)
      elementsRef.current = new Map();

    return elementsRef.current;
  }

  const changeDrag = (newDrag:drag) => {
    const [newElements, targetElement] = targetCopyElements(
      (!newDrag.active) ? (element:element) => element.isDragged :
                          (element:element) => element.id === newDrag.id);

    if (targetElement) {
      targetElement.isDragged = !targetElement.isDragged;
      setElements(newElements);
    }
    
    setDrag(newDrag);
  }

  const handleMouseDownElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, element:element) => {
    e.stopPropagation();

    if (e.button !== 0)
      return;

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);

    if (input.id === element.id) return;

    setInput(inputDefault);
    changeDrag({active:true, id:element.id, region:element.mouseoverRegion, offsetX:(e.clientX-element.x), offsetY:(e.clientY-element.y)});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, element:element) => {
    e.stopPropagation();

    if ((mouseDownX === e.clientX) &&
        (mouseDownY === e.clientY))
      (e.detail !== 2) ? setInput({state:INPUT_STATE.WRITING, id:element.id}) :
                       setInput({state:INPUT_STATE.FREE, id:-1});

    setMouseDownX(-1);
    setMouseDownY(-1);
    changeDrag(dragDefault);
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

    if (drag.active) {
      changeDrag(dragDefault);
      return;
    }

    let x = e.clientX;
    let y = e.clientY;

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const newElements = copyElements();
      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;
      const id = getNextId();

      setElements(newElements.concat({id:id, x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), fontSize:16, content:"", mouseoverRegion:REGION.NONE, isDragged: false, hasFocus:true, ex:[]}));
      setInput({state:INPUT_STATE.WRITING, id:id});
    }

    setMouseDownX(-1);
    setMouseDownY(-1);
  }

  const handleMouseDrag = (e:React.MouseEvent<SVGSVGElement>) => {
    const [newElements, targetElement] = targetCopyElements((element:element) => element.id === drag.id);
    const x = e.clientX;
    const y = e.clientY;

    switch(drag.region) {
      case REGION.BODY:
        targetElement.x = x-drag.offsetX;
        targetElement.y = y-drag.offsetY;
        break;
      case REGION.TOP_SIDE:
        console.log('top');
        console.log('hmm', getMap().get(targetElement.id).getBBox());
        if (y > targetElement.y) {
          console.log('going down');
        } else {
          console.log('going up');
        }
        break;
      case REGION.NONE:
      default:
    }

    setElements(newElements);
  }

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    if (drag.active)
      return handleMouseDrag(e);

    const x = e.clientX;
    const y = e.clientY;
    const domElements = elementsFromPoint(x, y, "svg");

    if (domElements.length === 0)
      return;

    const domElement = domElements[0];
    const map = getMap();
    var id = -1;
    Array.from(map, ([key, value]) => {
      if (domElement === value)
        id = key;
    }); //NOTE: I dont like that this calls on every element regardless

    if (id <= 0) return;

    const region = getRegion(x, y, domElement.getBoundingClientRect());
    const [newElements, targetElement] = targetCopyElements((element:element) => element.id === id);

    targetElement.mouseoverRegion = region;
    setElements(newElements);
  }

  useEffect(() => {
    if ((input.state === INPUT_STATE.WRITING) && (input.id > 0))
      getMap().get(input.id).focus();

    const [newElements, oldFocusedElement, newFocusedElement] = targetCopyElements(
      (element:element) => element.hasFocus,
      (element:element) => (element.id === input.id));

    if (oldFocusedElement) oldFocusedElement.hasFocus = false;
    if (newFocusedElement) newFocusedElement.hasFocus = true;

    setElements(newElements);

  }, [input]);

  const handleOnBlur = (content:string, id:number) => {
    if (content === "")
      setElements(copyElements().filter((element) => element.id !== id));
  }

  const handleKeyDown = (e:React.KeyboardEvent<SVGTextElement>) => {
    switch(e.key) {
      case "Shift":
      case "Alt" :
      case "Control" :
      case "ArrowRight" :
      case "ArrowLeft" :
      case "ArrowUp" :
      case "ArrowDown" :
      case "CapsLock" :
        return;
      default:
    }

    e.preventDefault();

    if ((input.state === INPUT_STATE.WRITING) && (input.id > 0)) {
      const [newElements, updatedElement] = targetCopyElements((element:element) => element.id === input.id);

      switch (e.key) {
      case "Backspace":
        updatedElement.content = updatedElement.content.slice(0, updatedElement.content.length-1); break;
      case "Enter":
        console.log('lol'); break;
      case "Tab":
        console.log('tab'); break;
      case "Delete":
        setInput(inputDefault);
        setElements(newElements.filter((element) => element.id !== input.id));
        return;
      default:
        //NOTE: This is also somewhat annoying - calling this comparison every time.  It would be better
        //      if pressing Shift 'primed' the next letter - or even keyUp on Shift, since that's when this
        //      becomes a problem.  Would have to weigh how often you have Shift pressed and released before typing a letter
        if (savedUpperCaseLetters.current.length>0) {
          updatedElement.content += savedUpperCaseLetters.current[0];
          savedUpperCaseLetters.current.shift();
        } else
          updatedElement.content += e.key;
      }

      setElements(newElements);
    }
  }

  const handleKeyUp = (e:React.KeyboardEvent<SVGTextElement>) => {
  }

  const ref = (id:number, node:any) => {
    if (!node) return () => {};

    const map = getMap();
    map.set(id, node);

    return () => map.delete(id);
  };

  return (
    <svg className="bg-rose-50 w-screen h-screen"
         onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e)}
         onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e)}
         onMouseMove={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseMove(e)}
         style={{
          ...drag.active ? { cursor:"grabbing" } : {}
         }}>
      {elements.map((element) =>
        <Element
          element={element}
          key={element.id}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e, element)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e, element)}
          parentOnBlur={handleOnBlur.bind(null, element.content, element.id)}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}
          self={getMap().get(element.id)}
          ref={ref.bind(null, element.id)}/>
      )}
    </svg>
  );
}
