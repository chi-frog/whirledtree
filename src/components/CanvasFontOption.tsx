import { useEffect, useLayoutEffect, useRef, useState } from "react";

type canvasFontOptionProps = {
  id:number,
  x:number,
  y:number,
  widths:number[],
  heights:number[],
  cornerRadiusPercentage:number,
  fontSize:number,
  font:string,
  notifyFontChange:Function,
  notifyFocused:Function,
  fonts:string[],
}

const INPUT_PADDING = 5;

export default function CanvasFontOption({
  id, x, y, widths, heights,
  cornerRadiusPercentage, fontSize, font, notifyFontChange, notifyFocused, fonts} : canvasFontOptionProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState((focused) ? widths[1] : widths[0]);
  const [height, setHeight] = useState((focused) ? heights[1] : heights[0]);
  const targetWidth = (focused) ? widths[1] : widths[0];
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
    notifyFocused(false);
  }

  const handleFocus = () => {
    setFocused(true);
    notifyFocused(id, true);
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
      height={height}
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
      {fonts.map((_font, index) => {
        if (index !== 0) return null;
        return (
          <g
            key={_font}>
            <rect
              width={width}
              height={height}
              rx={width*cornerRadiusPercentage}
              ry={height*cornerRadiusPercentage}
              stroke={focused ? "yellow" : "black"}
              fill={hovered ? "#EEEEEE" : 'white'}>
            </rect>
            <svg
              x={INPUT_PADDING}
              width={INPUT_PADDING + width}
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
          </g>
        );
      })}
    </svg>
    </>
  );
}