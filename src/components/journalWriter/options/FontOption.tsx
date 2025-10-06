import { calcFontDims, Dimension, Font } from "@/hooks/useFonts";
import { options } from "./Options";
import TextBox from "../svg/TextBox";
import useAnimation from "@/hooks/useAnimation";
import { useSystemFontContext, useFontsContext } from "../JournalWriter";
import { useEffect, useState } from "react";
import Scroller from "@/components/test/Scroller";

type Props = {
  focused:boolean,
  x:number,
  y:number,
  maxFontWidth:number,
  notifyMouseLeave:Function,
  notifySetFont:Function,
}

const FontOption:React.FC<Props> = ({
    focused, x, y, maxFontWidth,
    notifyMouseLeave, notifySetFont} : Props) => {
  const systemFont = useSystemFontContext();
  const fonts = useFontsContext();
  const _calcFontDims = () => calcFontDims("" + systemFont.name, systemFont);
  const [fontDims, setFontDims] = useState<Dimension>(_calcFontDims());

  useEffect(() => {
    if (!fonts.loaded) return;

    setFontDims(_calcFontDims());
  }, [fonts.loaded]);

  const getWidth = () =>
    (focused) ?
      (maxFontWidth + options.text.padding.x*2 + options.border.padding*2) :
      0;

  const getHeight = () =>
    (focused) ?
      (fontDims.height + options.text.padding.y*2 + options.border.padding)*5 + options.border.padding :
      0;

  const [width, height] = useAnimation(
    [getWidth, getHeight],
    [focused, systemFont]);

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
    fonts.all.map((_font:Font, _index:number) => {
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
      {focused &&
        <Scroller x={0} y={0} width={width} height={height}
          font={systemFont}
          labels={fonts.all.map((_font) => _font.name)}
          onClickHandlers={fonts.all.map((_font) => {
            return () => console.log('_font ' + _font.name);
          })}/>
      }
    </svg>
    </>
  );
}

export default FontOption;