'use client';
import React, { useState, useRef, useEffect, } from 'react';
import '../app/journalWriter.css';
import Element, { element } from './Element';
import { REGION } from './Region';
import useId from '@/hooks/useId';

//
// Returns a list of all elements under the cursor
//
function elementsFromPoint(x:number,y:number,stop:string) {
	var elements = [], previousPointerEvents = [], current, i, d;

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

const SVG_NS = "http://www.w3.org/2000/svg";

function getTestBBox(content:string, fontSize:number, x?:number, y?:number) {
  let fontSizeTest = document.createElementNS(SVG_NS, "text");
  fontSizeTest.setAttribute('font-size', "" + fontSize);
  fontSizeTest.setAttribute("font-family", "Arial");
  fontSizeTest.setAttribute('style', "visibility:hidden;");
  if (x) fontSizeTest.setAttribute('x', "" + x);
  if (y) fontSizeTest.setAttribute('y', "" + y);
  fontSizeTest.textContent = content;
  let canvas = document.querySelector("#sandbox");
  let bboxTest;

  if (canvas) {
    canvas.appendChild(fontSizeTest);
    bboxTest = fontSizeTest.getBBox();
    fontSizeTest.remove();
  } else
    bboxTest = {x:0, y:0, width:0, height:0};

  return bboxTest;
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



const DEFAULT_BASE_CONTENT = "";
const DEFAULT_FONT = "Arial";
const DEFAULT_ELEMENT_FONT_SIZE = 16;

export default function JournalWriterCanvas({elements, setElements} : {elements:element[], setElements:Function}) {
  const [mouseDownX, setMouseDownX] = useState<number>(-1);
  const [mouseDownY, setMouseDownY] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [focusedId, setFocusedId] = useState<number>(0);
  const [drag, setDrag] = useState<drag>(dragDefault);
  const elementsRef = useRef<Map<any, any>|null>(null);
  const [font, setFont] = useState<string>(DEFAULT_FONT);
  const [elementFontSize, setElementFontSize] = useState<number>(DEFAULT_ELEMENT_FONT_SIZE);
  const [baseContent, setBaseContent] = useState<string>(DEFAULT_BASE_CONTENT);
  const [mouseoverRegion, setMouseoverRegion] = useState<pEnum>(REGION.NONE);

  const {getId} = useId();

  const targetCopyElements = (...funcs:Function[]) : [element[], element] | [element[], element, element] => {
    const newElements = [...elements]
    const ret:any = [newElements];

    funcs.forEach ((func) => ret.push(newElements.find((_element:element) => func(_element))));

    return ret;
  }

  function getMap() {
    if (!elementsRef.current)
      elementsRef.current = new Map();

    return elementsRef.current;
  }

  const setElementOptionsFocus = (id:number, value:boolean) => {
    const [newElements, selectedElement] = targetCopyElements(
      (element:element) => element.id === id);

    selectedElement.optionsFocused = value;
    if (value)
      setFocusedId(0);

    setElements(newElements);
  };

  const handleMouseDownElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, element:element) => {
    e.stopPropagation();

    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);

    if (focusedId === element.id) return;

    setDrag({active:true, id:element.id, region:mouseoverRegion, offsetX:(e.clientX-element.x), offsetY:(e.clientY-element.y)});
  }

  const handleMouseUpElement = (e:React.MouseEvent<SVGTextElement, MouseEvent>, id:number) => {
    e.stopPropagation();

    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    if ((mouseDownX === e.clientX) &&
        (mouseDownY === e.clientY)) {
      if (selectedId !== id) {
        setElements((_newElements:element[]) => {
          const elementToRemoveIndex = _newElements.findIndex((_element:element) => (_element.id === id));
          const elementToRemove = _newElements.splice(elementToRemoveIndex, 1);
          _newElements.push(elementToRemove[0]);

          return _newElements;
        });
      }
        
      setSelectedId((e.detail !== 2) ? id : 0);
      setFocusedId((e.detail !== 2) ? id : 0);
      setMouseoverRegion((e.detail !== 2) ? REGION.BODY_FOCUSED : getMouseoverRegion(e.clientX, e.clientY));
    }

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
    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    setMouseDownX(e.clientX);
    setMouseDownY(e.clientY);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((e.button !== 0) ||
        (e.detail > 2))
      return;

    if ((mouseDownX === -1) ||
        (mouseDownY === -1))
      return;

    setMouseDownX(-1);
    setMouseDownY(-1);

    if (drag.active)
      return setDrag(dragDefault);

    if (e.detail === 2) {
      e.preventDefault();
      setSelectedId(0);
      setFocusedId(0);
      return;
    }

    let x = e.clientX;
    let y = e.clientY;

    if (Math.sqrt(Math.pow(y-mouseDownY, 2) + Math.pow(x-mouseDownX, 2)) <= 5) {
      const id = getId();

      const newElement = {
        id:id,
        x:x,
        y:y,
        fontSize:elementFontSize,
        fontFamily:font,
        content:baseContent,
        mouseoverRegion:REGION.NONE,
        optionsFocused:false,
        ex:[]};

      setElements((_elements:element[]) => elements.concat(newElement));
      setSelectedId(id);
      setFocusedId(id);
    }
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
        if (y > targetElement.y) {
        } else {
        }
        break;
      case REGION.NONE:
      default:
    }

    setElements(newElements);
  }

  const getMouseoverRegion = (x:number, y:number) => {
    const domElements = elementsFromPoint(x, y, "svg");

    if (domElements.length === 0)
      return REGION.NONE;

    // This will be a tspan - we want the text
    const domText = domElements[0].parentElement;

    if (!domText)
      return REGION.NONE;

    const elementId = domText.getAttribute('data-elementid');

    if (!elementId)
      return REGION.NONE;

    if (elementId === "" + focusedId)
      return REGION.BODY_FOCUSED;

    return getRegion(x, y, domText.getBoundingClientRect());
  }

  const handleMouseMove = (e:React.MouseEvent<SVGSVGElement>) => {
    if (drag.active)
      return handleMouseDrag(e);

    setMouseoverRegion(getMouseoverRegion(e.clientX, e.clientY));
  }

  const handleOnBlur = (content:string, id:number) => {
    console.log('canvas on blur');
    if (content === "")
      setElements((_elements:element[]) => _elements.filter((_element:element) => (_element.id !== id)));
    if (id === focusedId) {
      setFocusedId(0);
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
      const [newElements, updatedElement] = targetCopyElements((_element:element) => _element.id === selectedId);

      switch (e.key) {
      case "Backspace":
        updatedElement.content = updatedElement.content.slice(0, updatedElement.content.length-1); break;
      case "Enter":
        break;
      case "Tab":
        updatedElement.content += "   ";
        break;
      case "Delete":
        setSelectedId(0);
        setElements(newElements.filter((_element:element) => _element.id !== selectedId));
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

  const notifyElementFontSize = (id:number, fontSize:number) => {
    const [newElements, targetElement] = targetCopyElements((element:element) => element.id===id);

    targetElement.fontSize = fontSize;
    setElements(newElements);
  }

  return (
    <svg id="canvas"
      className="bg-rose-50 w-screen h-screen"
      onMouseDown={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseDown(e)}
      onMouseUp={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseUp(e)}
      onMouseMove={(e:React.MouseEvent<SVGSVGElement, MouseEvent>) => handleMouseMove(e)}
      style={{
        cursor: (mouseoverRegion === REGION.NONE) ? "default" :
                (mouseoverRegion === REGION.BODY_FOCUSED) ? "text" :
                ((mouseoverRegion === REGION.LEFT_SIDE) ||
                  mouseoverRegion === REGION.RIGHT_SIDE) ? "ew-resize" :
                ((mouseoverRegion === REGION.TOP_SIDE) ||
                  mouseoverRegion === REGION.BOTTOM_SIDE) ? "ns-resize" :
                ((mouseoverRegion === REGION.TOP_RIGHT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_LEFT_CORNER)) ? "sw-resize" :
                ((mouseoverRegion === REGION.TOP_LEFT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_RIGHT_CORNER)) ? "nw-resize" :
                (mouseoverRegion === REGION.BODY) ? "grab" : "default",
        ...drag.active ? { cursor:"grabbing" } : {}
      }}>
      {elements.map((element) =>
        <Element
          key={element.id}
          element={element}
          ref={ref.bind(null, element.id)}
          map={getMap()}
          selected={element.id === selectedId}
          focused={element.id === focusedId}
          isDragged={element.id === drag.id}
          notifyParentFocused={setElementOptionsFocus.bind(null, element.id)}
          notifyChangeFontSize={notifyElementFontSize.bind(null, element.id)}
          handleMouseDown={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseDownElement(e, element)}
          handleMouseUp={(e:React.MouseEvent<SVGTextElement, MouseEvent>) => handleMouseUpElement(e, element.id)}
          parentOnBlur={handleOnBlur.bind(null, element.content, element.id)}
          handleKeyDown={handleKeyDown}
          handleKeyUp={handleKeyUp}/>
      )}
    </svg>
  );
}
