'use client';
import React, { useState, useEffect, useRef, KeyboardEventHandler, MouseEventHandler } from 'react';
import '../app/journalWriter.css';
import ElementOptions from '@/components/ElementOptions';
import usePageVisibility from '@/hooks/usePageVisibility';

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`)
  }
}

//
// Returns a list of all elements under the cursor
//
function elementsFromPoint(x:number,y:number,stop:string) {
	var elements = [], previousPointerEvents = [], current, i, d;

  console.log('elementsFromPoint');

  // get all elements via elementFromPoint, and remove them from hit-testing in order
	while ((current = document.elementFromPoint(x,y) as HTMLElement) && elements.indexOf(current)===-1 && current != null) {
    // check if we are done searching
    if(current.nodeName === stop) break;

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
  selected:boolean,
  focused:boolean,
  optionsFocused:boolean,
  ex:pair[],
}

type elementProps = {
  element:element,
  ref?:any,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnFocus?:Function,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

function Element({element, ref, notifyParentFocused, notifyChangeFontSize,
                  handleMouseDown, handleMouseUp, parentOnFocus, parentOnBlur, handleKeyDown, handleKeyUp} : elementProps) {
  const optionsOffsetY = useRef<number>(element.fontSize*1.5);
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);

  const handleOnFocus = () => {
    if (parentOnFocus)
      parentOnFocus();
  }

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseOptionsEnter = () => setOptionsExpanded(true);

  const handleMouseOptionsLeave = () => setOptionsExpanded(false);

  return (
    <g>   
    <text x={element.x} y={element.y} tabIndex={0} ref={ref}
      fontSize={element.fontSize}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        whiteSpace: "break-spaces",
        outline: (element.focused) ? "1px solid gold" : 
                 (element.selected) ? "1px solid blue" : "none",
        userSelect: "none",
        cursor: (element.focused) ? "text" :
                (element.isDragged) ? "grabbing" :
                (element.mouseoverRegion === REGION.NONE) ? "default" :
                ((element.mouseoverRegion === REGION.LEFT_SIDE) ||
                  element.mouseoverRegion === REGION.RIGHT_SIDE) ? "ew-resize" :
                ((element.mouseoverRegion === REGION.TOP_SIDE) ||
                  element.mouseoverRegion === REGION.BOTTOM_SIDE) ? "ns-resize" :
                ((element.mouseoverRegion === REGION.TOP_RIGHT_CORNER) ||
                 (element.mouseoverRegion === REGION.BOTTOM_LEFT_CORNER)) ? "sw-resize" :
                ((element.mouseoverRegion === REGION.TOP_LEFT_CORNER) ||
                 (element.mouseoverRegion === REGION.BOTTOM_RIGHT_CORNER)) ? "nw-resize" :
                (element.mouseoverRegion === REGION.BODY) ? "grab" : "default"
      }}>
      <tspan
        style={{
        }}>
        {element.content}
      </tspan>
    </text>
    {element.selected &&
    <ElementOptions
      x={element.x}
      y={element.y}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      offsetY={optionsOffsetY}
      expanded={optionsExpanded}
      fontSize={element.fontSize}
      handleMouseEnter={handleMouseOptionsEnter}
      handleMouseLeave={handleMouseOptionsLeave}
      />
    }
    </g>
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
  const [selectedId, setSelectedId] = useState<number>(0); // ID cannot be 0
  const [drag, setDrag] = useState<drag>(dragDefault);
  const elementsRef = useRef<Map<any, any>|null>(null);
  const isPageVisible = usePageVisibility();
  const speedRef = useRef(false);

  var nextId = Date.now();
  const getNextId = () => nextId++;

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

  const setElementOptionsFocus = (value:boolean) => {
    const [newElements, selectedElement] = targetCopyElements(
      (element:element) => element.id === selectedId);

    selectedElement.optionsFocused = value;

    setElements(newElements);
  };

  const handleMouseDownElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, element:element) => {
    e.stopPropagation();

    if (e.button !== 0)
      return;

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);

    if (selectedId === element.id) return;

    changeDrag({active:true, id:element.id, region:element.mouseoverRegion, offsetX:(e.clientX-element.x), offsetY:(e.clientY-element.y)});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, element:element) => {
    e.stopPropagation();

    if (e.button !== 0)
      return;

    if ((mouseDownX === e.clientX) &&
        (mouseDownY === e.clientY))
      (e.detail !== 2) ? setSelectedId(element.id) :
                         setSelectedId(0);

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
    if (e.button !== 0)
      return;

    if ((mouseDownX === -1) ||
        (mouseDownY === -1))
      return;

    if (drag.active)
      return changeDrag(dragDefault);

    let x = e.clientX;
    let y = e.clientY;

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const newElements = copyElements();
      const DEFAULT_OFFSET_X = 0;
      const DEFAULT_OFFSET_Y = 0;
      const id = getNextId();

      setElements(newElements.concat({id:id, x:(x - DEFAULT_OFFSET_X), y:(y - DEFAULT_OFFSET_Y), fontSize:16, content:"", mouseoverRegion:REGION.NONE, isDragged: false, selected:true, focused:true, optionsFocused:false, ex:[]}));
      setSelectedId(id);
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
      if (value.contains(domElement))
        id = key;
    }); //NOTE: I dont like that this calls on every element regardless

    if (id <= 0) return;

    const [newElements, targetElement] = targetCopyElements((element:element) => element.id === id);

    targetElement.mouseoverRegion = getRegion(x, y, domElement.getBoundingClientRect());
    setElements(newElements);
  }

  useEffect(() => {
    console.log('selecting', selectedId);
    if (selectedId > 0)
      getMap().get(selectedId).focus();

    const [newElements, oldFocusedElement, newFocusedElement] = targetCopyElements(
      (element:element) => element.selected,
      (element:element) => (element.id === selectedId));

    if (oldFocusedElement) oldFocusedElement.selected = oldFocusedElement.focused = false;
    if (newFocusedElement) {
      newFocusedElement.selected = true;
      newFocusedElement.focused = true;
      // Move it to the end of the list, so it's drawn last and is the top layer
      newElements.splice(newElements.findIndex((element) => (element === newFocusedElement)), 1);
      newElements.push(newFocusedElement);
    }

    setElements(newElements);

  }, [selectedId]);

  const handleOnFocus = (id:number) => (id !== drag.id) &&
    setElements(copyElements().map((element) =>
      (element.id === id) ? {...element, focused:true} :
                            {...element}));

  const handleOnBlur = (content:string, id:number) => {
    if (content === "")
      setElements(copyElements().filter((element) => element.id !== id));
    else {
      setElements(elements.map((element) => (element.id !== id) ?
        element :
        {...element, focused:false}))
    }
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

    if (selectedId>0) {
      const [newElements, updatedElement] = targetCopyElements((element:element) => element.id === selectedId);

      switch (e.key) {
      case "Backspace":
        updatedElement.content = updatedElement.content.slice(0, updatedElement.content.length-1); break;
      case "Enter":
        console.log('lol'); break;
      case "Tab":
        console.log('tab'); break;
      case "Delete":
        setSelectedId(0);
        setElements(newElements.filter((element) => element.id !== selectedId));
        return;
      default:
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

  const setElementFontSize = (id:number, fontSize:number) => {
    const [newElements, targetElement] = targetCopyElements((element:element) => element.id===id);

    targetElement.fontSize = fontSize;
    setElements(newElements);
  }

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
          notifyParentFocused={setElementOptionsFocus}
          notifyChangeFontSize={setElementFontSize.bind(null, element.id)}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e, element)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e, element)}
          parentOnFocus={handleOnFocus.bind(null, element.id)}
          parentOnBlur={handleOnBlur.bind(null, element.content, element.id)}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}
          ref={ref.bind(null, element.id)}/>
      )}
    </svg>
  );
}
