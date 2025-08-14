'use client'
import ElementOptions from '@/components/ElementOptions';
import { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react';
import '../app/journalWriter.css';
import Cursor from './Cursor';
import { Leaf as LeafType } from '@/hooks/useLeaves';

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

type elementProps = {
  leaf:LeafType,
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

export default function Leaf({leaf, ref, map, selected, focused, isDragged, notifyParentFocused, notifyChangeFontSize,
                  handleMouseDown, handleMouseUp, parentOnBlur, handleKeyDown, handleKeyUp} : elementProps) {
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const [textHeight, setTextHeight] = useState<number[]>([leaf.fontSize, leaf.fontSize, leaf.fontSize]);
  const [textWidth, setTextWidth] = useState<number>(0);
  const cursorWidth = useRef<number>(0);

  useEffect(() => {
    cursorWidth.current = getTestBBox(leaf.fontSize)?.width;
  }, [leaf.fontSize]);

  useEffect(() => {
    let bbox = map.get(leaf.id).getBBox();
    console.log('here');

    setTextWidth(bbox.width);

    if (bbox.height === 0)
      bbox = getTestBBox(leaf.fontSize, leaf.x, leaf.y);

    setTextHeight(
      [bbox.height, // Full Height
       bbox.height - (((bbox.y + bbox.height) - leaf.y) * 2), // Height of only Letters
       bbox.height - ((bbox.y + bbox.height) - leaf.y)]); // Height of Letters and the Lower Empty Space
  }, [ref]);

  useEffect(() => {
    map.get(leaf.id).focus();
  }, [focused])

  const handleOnBlur = () => {
    if (parentOnBlur)
      parentOnBlur();
  };

  const handleMouseOptionsEnter = () => setOptionsExpanded(true);

  const handleMouseOptionsLeave = () => {
    if (!leaf.optionsFocused)
      setOptionsExpanded(false);
  }
  
  return (
    <g>
    <text
      x={leaf.x}
      y={leaf.y}
      data-elementid={leaf.id}
      ref={ref} tabIndex={0} 
      fontSize={leaf.fontSize}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleOnBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        fontFamily: leaf.font.name,
        whiteSpace: "break-spaces",
        outline: (focused) ? "1px solid gold" : 
                 (selected) ? "1px solid blue" : "none",
        userSelect: "none",
      }}>
      <tspan>
        {leaf.content}
      </tspan>
    </text>
    {focused &&
      <Cursor
        x={leaf.x + textWidth}
        y={leaf.y - textHeight[2]}
        width={cursorWidth.current}
        height={textHeight[0]}/>
    }
    {selected &&
    <ElementOptions
      x={leaf.x}
      y={leaf.y}
      textHeight={textHeight[1]}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      expanded={optionsExpanded}
      fontSize={leaf.fontSize}
      parentMouseEnter={handleMouseOptionsEnter}
      parentMouseLeave={handleMouseOptionsLeave}
      />
    }
    </g>
  );
}