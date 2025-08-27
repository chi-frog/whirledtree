import { Font, FontTb } from "@/hooks/useFont";
import { options } from "./Options";
import TextBox from "../svg/TextBox";
import useAnimation from "@/hooks/useAnimation";

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

  const [width, height] = useAnimation(
    [getWidth, getHeight],
    [focused, font]);

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