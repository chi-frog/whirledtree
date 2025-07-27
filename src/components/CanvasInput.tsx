import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LeafSVG from "./svg/leaf";

type elementInputProps = {
  id:number,
  x:number,
  y:number,
  fontSize:number,
  font:string,
}

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
    <LeafSVG
      x={x}
      y={y}
      width={15}
      height={15}
      />
    <svg
      x={x+15}
      y={y}
      width={60}
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
      <text
        x={'50%'}
        y={'50%'}
        dominantBaseline={'middle'}
        textAnchor={'middle'}
        fontSize={fontSize}>
        {font}
      </text>
    </svg>
    </>
  );
}