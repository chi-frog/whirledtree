import { Dimension, Font } from "@/hooks/useFont";
import { useEffect, useRef, useState } from "react";
import { options } from "./JournalWriterOptions";

type fontOptionProps = {
  id:number,
  x:number,
  y:number,
  labelWidth:number,
  labelHeight:number,
  cornerRadiusPercentage:number,
  font:Font,
  fontSize:number,
  availableFonts:Font[],
  maxFontWidth:number,
  notifyFontChange:Function,
  notifyFocused:Function,
}

export default function FontOption({
  id, x, y, labelWidth, labelHeight, cornerRadiusPercentage,
  font, fontSize, availableFonts, maxFontWidth,
  notifyFontChange, notifyFocused} : fontOptionProps) {

  let fontDims = font.getDims(fontSize);

  console.log('fontDims - FontOption', fontDims);

  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState((focused) ?
    maxFontWidth + options.text.padding*2 : 0);
  const [height, setHeight] = useState((focused) ?
    fontDims.height*5 : 0);
  const targetWidth = (focused) ?
    maxFontWidth + options.text.padding*2 : 0;
  const targetHeight = (focused) ?
    fontDims.height*5 : 0;

  const ref = useRef<SVGSVGElement>(null);
  const animationRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(animationRef.current);

    let start:number;
    const initialWidth = width;
    const initialHeight = height;
    const duration = 100;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time-start) / duration, 1);

      setWidth(initialWidth + (targetWidth-initialWidth)*progress);
      setHeight(initialHeight + (targetHeight-initialHeight)*progress);
      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [focused]);

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    console.log('mouseDown');
    e.stopPropagation();

    if (e.button !== 0)
      e.preventDefault();
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
    console.log('blurred');
    setFocused(false);
    notifyFocused(id, false);
  }

  const handleFocus = () => {
    console.log('focused');
    setFocused(true);
    notifyFocused(id, true);
  }

  const fontsJSX =
    availableFonts.map((_font:Font, _index:number) => {
      const dims = _font.getDims(fontSize);
      return (
        <g
          key={_font.name}>
          <rect
            x={width}
            y={_index*dims.height}
            width={width}
            height={dims.height}
            rx={width*cornerRadiusPercentage}
            ry={height*cornerRadiusPercentage}
            stroke={"yellow"}
            fill={hovered ? "#EEEEEE" : 'white'}>
          </rect>
          <text
            x={width/2 - dims.width}
            y={_index*dims.height + dims.height}
            fontSize={fontSize}>
            {_font.name}
          </text>
        </g>
      )});

  return (
    <>
    <svg
      x={x}
      y={y}
      width={labelWidth}
      height={labelHeight}
      ref={ref} tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onMouseEnter={(e) => handleMouseEnter(e)}
      onMouseLeave={(e) => handleMouseLeave(e)}
      style={{
        outline: "none",
        cursor: 'pointer',
      }}>
      {focused && fontsJSX}
    </svg>
    </>
  );
}