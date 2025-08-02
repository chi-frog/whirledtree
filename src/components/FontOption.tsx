import { useEffect, useLayoutEffect, useRef, useState } from "react";

type fontOptionProps = {
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

export default function FontOption({
  id, x, y, widths, heights,
  cornerRadiusPercentage, fontSize, font, notifyFontChange, notifyFocused, fonts} : fontOptionProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [width, setWidth] = useState((focused) ? widths[1] : widths[0]);
  const [height, setHeight] = useState((focused) ? heights[1] : heights[0]);
  const targetWidth = (focused) ? widths[1] : widths[0];
  const targetHeight = (focused) ? heights[1] : heights[0];
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
    e.stopPropagation();
    setFocused(true);
    console.log('here?');
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
    console.log('blurring');
    setFocused(false);
    notifyFocused(id, false);
  }

  const handleFocus = () => {
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
      {!focused &&
        <g>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            rx={width*cornerRadiusPercentage}
            ry={height*cornerRadiusPercentage}
            stroke={"black"}
            fill={hovered ? "#EEEEEE" : 'white'}>
          </rect>
          <text
            x={width/2 - widths[2]/2}
            y={height - heights[2]/2}
            fontSize={fontSize}>
            {font}
          </text>
        </g>
      }
      {focused &&
      fonts.map((_font, _index) => {
        return (
          <g
            key={_font}>
            <rect
              x={0}
              y={_index*height}
              width={width}
              height={focused ? heights[0] : height}
              rx={width*cornerRadiusPercentage}
              ry={height*cornerRadiusPercentage}
              stroke={focused ? "yellow" : "black"}
              fill={hovered ? "#EEEEEE" : 'white'}>
            </rect>
            <text
              x={0}
              y={_index*height}
              fontSize={fontSize}>
              {fonts[_index]}
            </text>
          </g>
        )})}
    </svg>
    </>
  );
}