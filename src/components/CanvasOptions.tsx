'use client'

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CanvasFontOption from "./CanvasFontOption"

const SVG_NS = "http://www.w3.org/2000/svg";

function getTestBBox(content:string, fontSize:number, x?:number, y?:number) {
  let fontSizeTest = document.createElementNS(SVG_NS, "text");
  fontSizeTest.setAttribute('font-size', "" + fontSize);
  fontSizeTest.setAttribute("font-family", "Arial");
  fontSizeTest.setAttribute('style', "visibility:hidden;");
  if (x) fontSizeTest.setAttribute('x', "" + x);
  if (y) fontSizeTest.setAttribute('y', "" + y);
  fontSizeTest.textContent = content;
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

const findWidestFont = (fonts:string[], fontSize:number) => {
  let largestWidth = 0;

  fonts.forEach((_font) => {
    const bbox = getTestBBox(_font, fontSize);

    if (bbox.width > largestWidth)
      largestWidth = bbox.width;
  });

  return largestWidth;
}

const DEFAULT_UNEXPANDED_SIZE = 30;
const BORDER_PADDING = 5;
const TEXT_PADDING = 5;
const INPUT_PADDING = 5;
const DEFAULT_EXPANDED_WIDTH = 80;
const DEFAULT_EXPANDED_HEIGHT = 40;

type canvasOptionsProps = {
  x:number,
  y:number,
  fontSize:number,
  font:string,
  notifyFontChange:Function,
  fonts:string[],
}

export default function CanvasOptions({x, y, fontSize, font, notifyFontChange, fonts} : canvasOptionsProps) {
  const [focusedOption, setFocusedOption] = useState<any>(0);

  const [textWidth, setTextWidth] = useState<number>(0);
  const [textHeight, setTextHeight] = useState<number>(0);
  const [maxFontWidth, setMaxFontWidth] = useState<number>(0);

  const fontOptionWidths = [
    textWidth + TEXT_PADDING*2 + BORDER_PADDING*2,
    maxFontWidth + TEXT_PADDING*2 + BORDER_PADDING*2];
  const fontOptionHeights = [
    textHeight + TEXT_PADDING*2 + BORDER_PADDING*2,
    (textHeight + TEXT_PADDING*2)*fonts.length + BORDER_PADDING*2,
  ];

  const [expanded, setExpanded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>((expanded) ?
    (focusedOption!==0) ? fontOptionWidths[1] :
    (textWidth>0) ? fontOptionWidths[0] :
    DEFAULT_EXPANDED_WIDTH : DEFAULT_UNEXPANDED_SIZE);
  const [height, setHeight] = useState<number>((expanded) ?
    (focusedOption!==0) ? fontOptionHeights[1] :
    (textHeight>0) ? fontOptionHeights[0] :
    DEFAULT_EXPANDED_HEIGHT : DEFAULT_UNEXPANDED_SIZE);
  const [opacity, setOpacity] = useState<number>(expanded ? 1 : 0.7);
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState<number>(expanded ? 0.1 : 0.5);

  const targetWidth = (expanded) ?
    (focusedOption!==0) ? fontOptionWidths[1] :
    (textWidth>0) ?  fontOptionWidths[0] :
    DEFAULT_EXPANDED_WIDTH : DEFAULT_UNEXPANDED_SIZE;
  const targetHeight = (expanded) ?
    (focusedOption!==0) ? fontOptionHeights[1] :
    (textHeight>0) ? fontOptionHeights[0] :
    DEFAULT_EXPANDED_HEIGHT : DEFAULT_UNEXPANDED_SIZE;
  const targetOpacity = (expanded) ? 1 : 0.7;
  const targetCornerRadiusPercentage = (expanded) ? 0.1 : 0.5;
  const animationRef = useRef(0);

  const idRef = useRef(Date.now());
  const getNextId = () => idRef.current++;

  useLayoutEffect(() => {
    const maxFontWidth = findWidestFont(fonts, fontSize);

    console.log('maxFontWidth', maxFontWidth);

    setMaxFontWidth(maxFontWidth);
  }, [fonts]);

  useEffect(() => {
    const bbox = getTestBBox(font, fontSize);
    console.log('textWidth', bbox.width);
    console.log('textHeight', bbox.height);

    setTextWidth(bbox.width);
    setTextHeight(bbox.height);
  }, [font, fontSize]);

  useEffect(() => {
      cancelAnimationFrame(animationRef.current);
  
      let start:number;
      const initialWidth = width;
      const initialHeight = height;
      const initialOpacity = opacity;
      const initialCornerRadiusPercentage = cornerRadiusPercentage;
      const duration = 100;
  
      function animate(time:number) {
        if (!start) start = time;
  
        const progress = Math.min((time-start) / duration, 1);
  
        setWidth(initialWidth + (targetWidth-initialWidth)*progress);
        setHeight(initialHeight + (targetHeight-initialHeight)*progress);
        setOpacity(initialOpacity + (targetOpacity-initialOpacity)*progress);
        setCornerRadiusPercentage(initialCornerRadiusPercentage + (targetCornerRadiusPercentage-initialCornerRadiusPercentage)*progress);
  
        if (progress < 1)
          animationRef.current = requestAnimationFrame(animate);
      }
  
      animationRef.current = requestAnimationFrame(animate);
  
      return () => cancelAnimationFrame(animationRef.current);
    }, [expanded, focusedOption, textWidth, maxFontWidth, textHeight,]);

  const handleMouseEnter = () => setExpanded(true);

  const handleMouseLeave = () => setExpanded(true);

  const handleMouseDown = (e:any) => {
    e.stopPropagation();
  }

  const notifyFocused = (id:number, focused:boolean) => {
    if (focused)
      setFocusedOption(id);
    else
      setFocusedOption(0);
  }

  console.log('width height ' + width, height);
  console.log('targetW targetH ' + targetWidth, targetHeight);
  console.log('focop', focusedOption);

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <rect
        width={width}
        height={height}
        fill='#ADD8E6'
        rx={width * cornerRadiusPercentage}
        ry={height * cornerRadiusPercentage}
        opacity={opacity}
        />
      {expanded &&
      <CanvasFontOption
        id={getNextId()}
        x={BORDER_PADDING}
        y={BORDER_PADDING}
        widths={fontOptionWidths.map((width) => width - BORDER_PADDING*2)}
        heights={fontOptionHeights.map((height) => height - BORDER_PADDING*2)}
        cornerRadiusPercentage={cornerRadiusPercentage}
        fontSize={fontSize}
        font={font}
        notifyFontChange={notifyFontChange}
        notifyFocused={notifyFocused}
        fonts={fonts}/>}
    </svg>
  );
}
