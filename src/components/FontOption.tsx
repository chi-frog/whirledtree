import { Font, FontTb } from "@/hooks/useFont";
import { useEffect, useRef, useState } from "react";
import { options } from "./JournalWriterOptions";
import TextBox from "./svg/TextBox";

type fontOptionProps = {
  focused:boolean,
  x:number,
  y:number,
  font:Font,
  fontSize:number,
  availableFonts:Font[],
  maxFontWidth:number,
  fontTb:FontTb,
  notifyMouseLeave:Function,
  notifySetFont:Function,
}

export default function FontOption({
  focused, x, y,
  font, fontSize, availableFonts, maxFontWidth, fontTb,
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
      return (
        <g
          key={_font.name}>
          <TextBox
            x={options.border.padding}
            y={options.border.padding + (_index*(sysFontHeight + options.text.padding.y*2 + options.border.padding))}
            height={sysFontHeight}
            padding={options.text.padding}
            cornerRadiusPercentage={0.1}
            text={_font.name}
            font={_font}
            fontSize={fontSize}
            fontTb={fontTb}
            onMouseDown={(e) => handleMouseDown(e, _font)} />
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