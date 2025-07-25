'use client'
import ElementOptions from '@/components/ElementOptions';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { REGION } from './Region';
import '../app/journalWriter.css';
import Cursor from './Cursor';

type pEnum = {
  text:string,
}

export type pair = {
  key: string,
  value: number,
}

const SVG_NS = "http://www.w3.org/2000/svg";

function getTestBBox(fontSize:number, x?:number, y?:number) {
  let fontSizeTest = document.createElementNS(SVG_NS, "text");
  fontSizeTest.setAttribute('font-size', "" + fontSize);
  fontSizeTest.setAttribute("font-family", "Arial");
  fontSizeTest.setAttribute('style', "visibility:hidden;");
  if (x) fontSizeTest.setAttribute('x', ""+x);
  if (y) fontSizeTest.setAttribute('y', ""+y);
  fontSizeTest.textContent = "|";
  let canvas = document.querySelector("#canvas");
  let bboxTest;

  if (canvas) {
    canvas.appendChild(fontSizeTest);
    bboxTest = fontSizeTest.getBBox();
    fontSizeTest.remove();
  } else
    bboxTest = {x:0, y:0, width:0, height:0};

  return bboxTest;
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
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  handleMouseDown?:MouseEventHandler<SVGTextElement>,
  handleMouseUp?:MouseEventHandler<SVGTextElement>,
  parentOnBlur?:Function,
  handleKeyDown?:KeyboardEventHandler<SVGTextElement>,
  handleKeyUp?:KeyboardEventHandler<SVGTextElement>,
}

export default function Element({element, ref, map, selected, focused, isDragged, notifyParentFocused, notifyChangeFontSize,
                  handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : elementProps) {
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const [textHeight, setTextHeight] = useState<number[]>([element.fontSize, element.fontSize, element.fontSize]);
  const [textWidth, setTextWidth] = useState<number>(0);
  const cursorWidth = useRef<number>(0);

  useEffect(() => {
    cursorWidth.current = getTestBBox(element.fontSize)?.width;
  }, [element.fontSize]);

  useEffect(() => {
    let bbox = map.get(element.id).getBBox();

    setTextWidth(bbox.width);

    if (bbox.height === 0)
      bbox = getTestBBox(element.fontSize, element.x, element.y);

    setTextHeight(
      [bbox.height, // Full Height
       bbox.height - (((bbox.y + bbox.height) - element.y) * 2), // Height of only Letters
       bbox.height - ((bbox.y + bbox.height) - element.y)]); // Height of Letters and the Lower Empty Space
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
      data-elementid={element.id}
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
      }}>
      <tspan>
        {element.content}
      </tspan>
    </text>
    {focused &&
      <Cursor
        x={element.x + textWidth}
        y={element.y - textHeight[2]}
        width={cursorWidth.current}
        height={textHeight[0]}/>
    }
    {selected &&
    <ElementOptions
      x={element.x}
      y={element.y}
      textHeight={textHeight[1]}
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