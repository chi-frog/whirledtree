import { MouseEventHandler, RefObject, useEffect, useRef, useState } from "react";
import ElementInput from '@/components/ElementInput';

type elementOptionsProps = {
  x:number,
  y:number,
  notifyParentFocused?:Function,
  notifyChangeFontSize?:Function,
  offsetY:RefObject<number>,
  expanded:boolean,
  fontSize:number,
  handleMouseEnter:MouseEventHandler<SVGRectElement>,
  handleMouseLeave:MouseEventHandler<SVGRectElement>,
}

const DEFAULT_OPTIONS_TEXT_SIZE = 16;
const DEFAULT_OPTIONS_UNEXPANDED_SIZE = 10;
const DEFAULT_OPTIONS_EXPANDED_WIDTH = 60;
const DEFAULT_OPTIONS_EXPANDED_HEIGHT = 40;
const DEFAULT_OPTIONS_UNEXPANDED_OPACITY = 0.7;
const DEFAULT_OPTIONS_EXPANDED_OPACITY = 1;

export default function ElementOptions({x, y, notifyParentFocused, notifyChangeFontSize, offsetY, expanded, fontSize, handleMouseEnter, handleMouseLeave} : elementOptionsProps) {
  const [width, setWidth] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_WIDTH : DEFAULT_OPTIONS_UNEXPANDED_SIZE);
  const [height, setHeight] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_HEIGHT : DEFAULT_OPTIONS_UNEXPANDED_SIZE);
  const [opacity, setOpacity] = useState(expanded ? DEFAULT_OPTIONS_EXPANDED_OPACITY : DEFAULT_OPTIONS_UNEXPANDED_OPACITY);
  const [moveX, setMoveX] = useState(expanded ? 20 : 0);
  const [moveY, setMoveY] = useState(expanded ? 20 : 0);
  const [cornerRadiusPercentage, setCornerRadiusPercentage] = useState(expanded ? 0.1 : 0.5);
  const targetWidth = expanded ? DEFAULT_OPTIONS_EXPANDED_WIDTH : DEFAULT_OPTIONS_UNEXPANDED_SIZE;
  const targetHeight = expanded ? DEFAULT_OPTIONS_EXPANDED_HEIGHT : DEFAULT_OPTIONS_UNEXPANDED_SIZE;
  const targetOpacity = expanded ? DEFAULT_OPTIONS_EXPANDED_OPACITY : DEFAULT_OPTIONS_UNEXPANDED_OPACITY;
  const targetMoveX = expanded ? -2 : 0;
  const targetMoveY = expanded ? 28 : 0;
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

  const handleMouseDown = (e:React.MouseEvent<SVGGElement, MouseEvent>) => {
    console.log('handleMouseDown elementOptions');
    e.stopPropagation();
  }

  const handleMouseUp = (e:React.MouseEvent<SVGGElement, MouseEvent>) => {
    console.log('handleMouseUp elementOptions');
    e.stopPropagation();
  }

  return (
    <g
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
    <rect
      x={x - width - moveX}
      y={y - offsetY.current - moveY}
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
    <ElementInput
      id={getNextId()}
      x={x - width - moveX + 5}
      y={y - offsetY.current - moveY + 5}
      notifyParentFocused={notifyParentFocused}
      notifyChangeFontSize={notifyChangeFontSize}
      parentWidth={width}
      parentHeight={height}
      elementFontSize={fontSize}
      fontSize={DEFAULT_OPTIONS_TEXT_SIZE}
      />
    }
    </g>
  );
}