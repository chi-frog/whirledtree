import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LeafSVG from "./svg/leaf";

const SVG_NS = "http://www.w3.org/2000/svg";

function getTestBBox(content:string, fontSize:number, x?:number, y?:number) {
  let fontSizeTest = document.createElementNS(SVG_NS, "text");
  fontSizeTest.setAttribute('font-size', "" + fontSize);
  fontSizeTest.setAttribute("font-family", "Arial");
  fontSizeTest.setAttribute('style', "visibility:hidden;");
  if (x) fontSizeTest.setAttribute('x', ""+x);
  if (y) fontSizeTest.setAttribute('y', ""+y);
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

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  fontSize:number,
  font:string,
  notifyFontChange:Function,
  fonts:string[],
  textWidth:number,
}

const DEFAULT_LEAF_SIZE = 15;
const DEFAULT_INPUT_SPACING = 5;

export default function CanvasInput({id, x, y, fontSize, font, notifyFontChange, fonts, textWidth} : elementInputProps) {
  const maxWidth = useRef<number>(0);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState(
    (focused) ?
      maxWidth.current + DEFAULT_INPUT_SPACING*2 :
      textWidth + DEFAULT_INPUT_SPACING*3 + DEFAULT_LEAF_SIZE);
  const targetWidth =
    (focused) ?
      maxWidth.current + DEFAULT_INPUT_SPACING*2 :
      textWidth + DEFAULT_INPUT_SPACING*3 + DEFAULT_LEAF_SIZE;
  const textHeight = useRef<number>(0);
  const ref = useRef<SVGSVGElement>(null);

  const animationRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(animationRef.current);

    let start:number;
    const initialWidth = width;
    const duration = 100;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time-start) / duration, 1);

      setWidth(initialWidth + (targetWidth-initialWidth)*progress);
      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [focused]);

  const findWidestFont = () => {
    let largestWidth = 0;

    fonts.forEach((_font) => {
      const bbox = getTestBBox(_font, fontSize);

      if (bbox.width > largestWidth)
        largestWidth = bbox.width;
    });

    return largestWidth;
  }

  useEffect(() => {
    maxWidth.current = findWidestFont();
  }, []);

  useEffect(() => {
    console.log('font', font);
    const bbox = getTestBBox(font, fontSize);

    console.log('bbox in canvasinput', bbox);
    console.log('textWidth', textWidth);
    textHeight.current = bbox.height;
  }, [font]);

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setFocused(true);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleMouseEnter = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setHovered(true);
  };

  const handleMouseLeave = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setHovered(false);
  };

  const handleBlur = () => {
    setFocused(false);
  }

  const handleFocus = () => {
    setFocused(true);
  }

  useLayoutEffect(() => {
    if (focused && ref)
      ref.current?.focus();
  }, [focused]);

  return (
    <>
    <svg
      x={x}
      y={y}
      width={width}
      height={textHeight.current + 10}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onMouseEnter={(e) => handleMouseEnter(e)}
      onMouseLeave={(e) => handleMouseLeave(e)}
      style={{
        outline: "none",
        visibility: textHeight.current > 0 ? 'visible' : 'hidden',
        cursor: 'pointer',
      }}>
      <rect
        rx={10}
        ry={10}
        width={'100%'}
        height={'100%'}
        stroke={focused ? "yellow" : "black"}
        fill={hovered ? "#EEEEEE" : 'white'}>
      </rect>
      <svg
        x={DEFAULT_INPUT_SPACING}
        width={DEFAULT_INPUT_SPACING + textWidth}
        height={'100%'}
        style={{
          pointerEvents:'auto'
        }}>
        <text
          x={0}
          y={'50%'}
          dominantBaseline={'middle'}
          fontSize={fontSize}>
          {font}
        </text>
      </svg>
      <LeafSVG
        x={DEFAULT_INPUT_SPACING*2 + textWidth}
        y={(textHeight.current + 10)/2 - DEFAULT_LEAF_SIZE/2}
        width={DEFAULT_LEAF_SIZE}
        height={DEFAULT_LEAF_SIZE}
        />
    </svg>
    </>
  );
}