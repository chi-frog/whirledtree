import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LeafSVG from "./svg/leaf";

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  fontSize:number,
  font:string,
}

const DEFAULT_LEAF_SIZE = 15;
const DEFAULT_INPUT_SPACING = 5;
const DEFAULT_INPUT_WIDTH = 80;

export default function CanvasInput({id, x, y, fontSize, font} : elementInputProps) {
  const [focused, setFocused] = useState(false);
  const [desiredFont, setDesiredFont] = useState<string>(font);
  const [textHeight, setTextHeight] = useState<number>(0);
  const ref = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setFocused(true);
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

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

  useEffect(() => {
    if (!ref || !ref.current) return;

    const text = ref.current.querySelector('text');
    if (!text) return;

    setTextHeight(text.getBBox().height);
  }, [font]);

  return (
    <>
    <svg
      x={x}
      y={y}
      width={DEFAULT_INPUT_WIDTH}
      height={textHeight + 10}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      style={{
        outline: "none",
        visibility: (textHeight > 0) ? 'visible' : 'hidden', // This is so that it doesnt flicker
        cursor: 'pointer'
      }}>
      <rect
        rx={10}
        width={'100%'}
        height={'100%'}
        stroke={focused ? "yellow" : "none"}
        fill="white">
      </rect>
      <svg
        x={DEFAULT_LEAF_SIZE + DEFAULT_INPUT_SPACING*2}
        width={DEFAULT_INPUT_WIDTH - DEFAULT_LEAF_SIZE - DEFAULT_INPUT_SPACING*2}
        height={'100%'}>
        <text
          y={'50%'}
          dominantBaseline={'middle'}
          fontSize={fontSize}>
          {font}
        </text>
      </svg>
    </svg>
    <LeafSVG
      x={x + DEFAULT_INPUT_SPACING}
      y={y + (textHeight + 10)/2 - DEFAULT_LEAF_SIZE/2}
      width={DEFAULT_LEAF_SIZE}
      height={DEFAULT_LEAF_SIZE}
      />
    </>
  );
}