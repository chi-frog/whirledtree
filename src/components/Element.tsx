'use client'
import ElementOptions from '@/components/ElementOptions';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { REGION } from './Region';
import '../app/journalWriter.css';

type pEnum = {
  text:string,
}

export type pair = {
  key: string,
  value: number,
}

export type element = {
  id:number,
  x:number,
  y:number,
  fontSize:number,
  fontFamily:string,
  content:string,
  optionsFocused:boolean,
  ex:pair[],
}

type elementProps = {
  element:element,
  ref?:any,
  map?:any,
  selected:boolean,
  focused:boolean,
  isDragged:boolean,
  mouseoverRegion:pEnum,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

export default function Element({element, ref, map, selected, focused, isDragged, mouseoverRegion, notifyParentFocused, notifyChangeFontSize,
                  handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : elementProps) {
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const [textHeight, setTextHeight] = useState<number>(element.fontSize);

  useEffect(() => {
    const bbox = map.get(element.id).getBBox();
    if (bbox.height === 0) return; // So we keep the default

    setTextHeight(bbox.height - (((bbox.y + bbox.height) - element.y) * 2));
  }, [ref]);

  useEffect(() => {
    map.get(element.id).focus();
  }, [focused])

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseOptionsEnter = () => setOptionsExpanded(true);

  const handleMouseOptionsLeave = () => {
    if (!element.optionsFocused)
      setOptionsExpanded(false);
  }

  return (
    <g>
    <text
      x={element.x}
      y={element.y}
      ref={ref} tabIndex={0} 
      fontSize={element.fontSize}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        fontFamily: element.fontFamily,
        whiteSpace: "break-spaces",
        outline: (focused) ? "1px solid gold" : 
                 (selected) ? "1px solid blue" : "none",
        userSelect: "none",
        cursor: (focused) ? "text" :
                (isDragged) ? "grabbing" :
                (mouseoverRegion === REGION.NONE) ? "default" :
                ((mouseoverRegion === REGION.LEFT_SIDE) ||
                  mouseoverRegion === REGION.RIGHT_SIDE) ? "ew-resize" :
                ((mouseoverRegion === REGION.TOP_SIDE) ||
                  mouseoverRegion === REGION.BOTTOM_SIDE) ? "ns-resize" :
                ((mouseoverRegion === REGION.TOP_RIGHT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_LEFT_CORNER)) ? "sw-resize" :
                ((mouseoverRegion === REGION.TOP_LEFT_CORNER) ||
                 (mouseoverRegion === REGION.BOTTOM_RIGHT_CORNER)) ? "nw-resize" :
                (mouseoverRegion === REGION.BODY) ? "grab" : "default"
      }}>
      <tspan>
        {element.content}
      </tspan>
    </text>
    {selected &&
    <ElementOptions
      x={element.x}
      y={element.y}
      textHeight={textHeight}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      expanded={optionsExpanded}
      fontSize={element.fontSize}
      parentMouseEnter={handleMouseOptionsEnter}
      parentMouseLeave={handleMouseOptionsLeave}
      />
    }
    </g>
  );
}