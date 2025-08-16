import { Font } from "@/hooks/useFont";
import { useEffect, useRef, useState } from "react";
import { options } from "./JournalWriterOptions";

type fontOptionProps = {
  focused:boolean,
  x:number,
  y:number,
  font:Font,
  fontSize:number,
  availableFonts:Font[],
  maxFontWidth:number,
  notifyMouseLeave:Function,
  notifySetFont:Function,
}

export default function FontOption({
  focused, x, y,
  font, fontSize, availableFonts, maxFontWidth,
  notifyMouseLeave, notifySetFont} : fontOptionProps) {

  let fontDims = font.getDims(fontSize);

  const getWidth = () =>
    (focused) ?
      (maxFontWidth + options.text.padding.x*2 + options.border.padding*2) :
      0;

  const getHeight = () =>
    (focused) ?
      (fontDims.height + options.text.padding.y*2 + options.border.padding)*5 + options.border.padding :
      0;

  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());
  const targetWidth = getWidth();
  const targetHeight = getHeight();

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
  }, [focused, font]);

  const handleMouseDown = (e:React.MouseEvent<SVGRectElement, MouseEvent>, font:Font) => {
    e.stopPropagation();
    if (e.button !== 0)
      e.preventDefault();

    notifySetFont(font);
  }

  const handleMouseLeave = () => {
    notifyMouseLeave();
  }

  const sysFontHeight = fontDims.height;
  const fontsJSX =
    availableFonts.map((_font:Font, _index:number) => {
      const dims = _font.getDims(fontSize);

      return (
        <g
          key={_font.name}>
          <rect
            className="cursor-pointer stroke-black hover:stroke-yellow-200 hover:fill-gray-200"
            x={options.border.padding}
            y={options.border.padding + (_index*(sysFontHeight + options.text.padding.y*2 + options.border.padding))}
            width={width - options.border.padding*2}
            height={sysFontHeight + options.text.padding.y*2}
            rx={5}
            ry={5}
            fill={'white'}
            onMouseDown={(e) => handleMouseDown(e, _font)}>
          </rect>
          <text
            className='pointer-events-none'
            x={options.border.padding + (width - options.border.padding*2)/2 - (dims.width/2)}
            y={options.border.padding + (dims.height + options.text.padding.y*2)/2 + (dims.textHeight/2) + (_index*(sysFontHeight + options.text.padding.y*2 + options.border.padding))}
            fontSize={fontSize}
            style={{
              fontFamily:_font.name
            }}>
            {_font.name}
          </text>
        </g>
      )});

  return (
    <>
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      onMouseLeave={handleMouseLeave}
      style={{
        outline: "none",
      }}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={5}
        ry={5}
        fill='#ADD8E6' />
      {focused && fontsJSX}
    </svg>
    </>
  );
}