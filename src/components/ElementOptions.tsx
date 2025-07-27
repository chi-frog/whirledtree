import { MouseEvent, MouseEventHandler, RefObject, useEffect, useRef, useState } from "react";
import ElementInput from '@/components/ElementInput';

type elementOptionsProps = {
  x:number,
  y:number,
  textHeight:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  expanded:boolean,
  fontSize:number,
  parentMouseEnter:MouseEventHandler<SVGSVGElement>,
  parentMouseLeave:MouseEventHandler<SVGSVGElement>,
}

const DEFAULT_OPTIONS_TEXT_SIZE = 16;
const DEFAULT_OPTIONS_UNEXPANDED_SIZE = 10;
const DEFAULT_OPTIONS_EXPANDED_WIDTH = 80;
const DEFAULT_OPTIONS_EXPANDED_HEIGHT = 40;
const DEFAULT_OPTIONS_UNEXPANDED_OPACITY = 0.7;
const DEFAULT_OPTIONS_EXPANDED_OPACITY = 1;

export default function ElementOptions({x, y, textHeight, notifyParentFocused, notifyChangeFontSize, expanded, fontSize, parentMouseEnter, parentMouseLeave} : elementOptionsProps) {
  const [width, setWidth] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_WIDTH : DEFAULT_OPTIONS_UNEXPANDED_SIZE);
  const [height, setHeight] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_HEIGHT : DEFAULT_OPTIONS_UNEXPANDED_SIZE);
  const [opacity, setOpacity] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_OPACITY : DEFAULT_OPTIONS_UNEXPANDED_OPACITY);
  const [hovered, setHovered] = useState<string>("");
  const [moveX, setMoveX] = useState(expanded ? 0 : 0);
  const [moveY, setMoveY] = useState(expanded ? 0 : 0);
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState(expanded ? 0.1 : 0.5);
  const targetWidth = expanded ? DEFAULT_OPTIONS_EXPANDED_WIDTH : DEFAULT_OPTIONS_UNEXPANDED_SIZE;
  const targetHeight = expanded ? DEFAULT_OPTIONS_EXPANDED_HEIGHT : DEFAULT_OPTIONS_UNEXPANDED_SIZE;
  const targetOpacity = expanded ? DEFAULT_OPTIONS_EXPANDED_OPACITY : DEFAULT_OPTIONS_UNEXPANDED_OPACITY;
  const targetMoveX = expanded ? 0 : 0;
  const targetMoveY = expanded ? 0 : 0;
  const targetCornerRadiusPercentage = expanded ? 0.1 : 0.5;
  const animationRef = useRef(0);

  var nextId = Date.now();
  function getNextId() {
    return nextId++;
  }
  
  useEffect(() => {
    cancelAnimationFrame(animationRef.current);

    let start:number;
    const initialWidth = width;
    const initialHeight = height;
    const initialOpacity = opacity;
    const initialMoveX = moveX;
    const initialMoveY = moveY;
    const initialCornerRadiusPercentage = cornerRadiusPercentage;
    const duration = 100;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time-start) / duration, 1);

      setWidth(initialWidth + (targetWidth-initialWidth)*progress);
      setHeight(initialHeight + (targetHeight-initialHeight)*progress);
      setOpacity(initialOpacity + (targetOpacity-initialOpacity)*progress);
      setMoveX(initialMoveX + (targetMoveX-initialMoveX)*progress);
      setMoveY(initialMoveY + (targetMoveY-initialMoveY)*progress);
      setCornerRadiusPercentage(initialCornerRadiusPercentage + (targetCornerRadiusPercentage-initialCornerRadiusPercentage)*progress);

      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [expanded]);

  const handleMouseDown = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleMouseUp = (e:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }

  const handleMouseEnter = (left:boolean) => {
    setHovered(left ? "left" : "right");
  }

  const handleMouseLeave = () => {
    setHovered("");
  }

  const handleArrowPressed = (e:React.MouseEvent<SVGSVGElement, MouseEvent>, left:boolean) => {
    e.stopPropagation();
    if (notifyChangeFontSize) notifyChangeFontSize(left ? fontSize-1 : fontSize+1);
  }

  const DEFAULT_SPACING_X = 5;

  return (
    <svg
      x={x - width - DEFAULT_SPACING_X}
      y={y - textHeight/2 - height/2}
      width={width}
      height={height}
      onMouseDown={(e:any) => handleMouseDown(e)}
      onMouseUp={(e:any) => handleMouseUp(e)}
      onMouseEnter={parentMouseEnter}
      onMouseLeave={parentMouseLeave}>
    <rect
      width={width}
      height={height}
      rx={cornerRadiusPercentage*width}
      ry={cornerRadiusPercentage*height}
      fill="#ADD8E6"
      fillOpacity={opacity}
      stroke="#F4F3FF"
      strokeWidth="1.5"
    />
    {expanded &&
    <rect
      x={2}
      y={5}
      width={20}
      height={height-10}
      rx={5}
      onMouseEnter={() => handleMouseEnter(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e:any) => handleArrowPressed(e, true)}
      style={{
        fill: (hovered === "left") ? "#DDDDDD" : "none",
        pointerEvents:"visible",
        cursor:"pointer",
      }}/>
    }
    {expanded &&
    <svg
      viewBox="0 0 150 300"
      x={2}
      y={10}
      width={15}
      height={height-20}>
      <path xmlns="http://www.w3.org/2000/svg"
        style={{
          pointerEvents:"none",
          fill:"none",
          stroke: (hovered === "left") ? "yellow" : "black",
          strokeWidth:30,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray:"none",
          strokeOpacity:1}} 
        d="M 129,21 21,150 129,279"/>
    </svg>
    }
    {expanded &&
    <rect
      x={width-23}
      y={5}
      width={20}
      height={height-10}
      rx={5}
      onMouseEnter={() => handleMouseEnter(false)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e:any) => handleArrowPressed(e, false)}
      style={{
        fill: (hovered === "right") ? "#DDDDDD" : "none",
        pointerEvents:"visible",
        cursor:"pointer",
      }}/>
    }
    {expanded &&
    <svg
      viewBox="0 0 150 300"
      x={width-18}
      y={10}
      width={15}
      height={height-20}>
      <path xmlns="http://www.w3.org/2000/svg"
        style={{
          pointerEvents:"none",
          fill:"none",
          stroke: (hovered === "right") ? "yellow" : "black",
          strokeWidth:30,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray:"none",
          strokeOpacity:1}} 
        d="M 21,21 129,150 21,279"/>
    </svg>
    }
    {expanded &&
    <ElementInput
      id={getNextId()}
      x={x - width - DEFAULT_SPACING_X}
      y={y - textHeight/2 - height/2}
      width={height-5}
      height={height-10}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      parentWidth={width}
      parentHeight={height}
      elementFontSize={fontSize}
      fontSize={DEFAULT_OPTIONS_TEXT_SIZE}
      />
    }
    </svg>
  );
}