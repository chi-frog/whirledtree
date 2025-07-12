import { MouseEventHandler, RefObject, useEffect, useRef, useState } from "react";
import ElementInput from '@/components/ElementInput';

type elementOptionsProps = {
  x:number,
  y:number,
  offsetY:RefObject<number>,
  expanded:boolean,
  fontSize:number,
  handleMouseEnter:MouseEventHandler<SVGRectElement>,
  handleMouseLeave:MouseEventHandler<SVGRectElement>,
}

const DEFAULT_OPTIONS_TEXT_SIZE = 16;

export default function ElementOptions({x, y, offsetY, expanded, fontSize, handleMouseEnter, handleMouseLeave} : elementOptionsProps) {
  const [size, setSize] = useState(expanded ? 40 : 10);
  const [opacity, setOpacity] = useState(expanded ? 1 : 0.7);
  const [moveX, setMoveX] = useState(expanded ? 20 : 0);
  const [moveY, setMoveY] = useState(expanded ? 20 : 0);
  const [cornerRadius, setCornerRadius] = useState(expanded ? size : 5);
  const targetSize = expanded ? 40 : 10;
  const targetOpacity = expanded ? 1 : 0.7;
  const targetMoveX = expanded ? -2 : 0;
  const targetMoveY = expanded ? 28 : 0;
  const targetCornerRadius = expanded ? 0.1 : 0.5;
  const animationRef = useRef(0);

  var nextId = Date.now();
  function getNextId() {
    return nextId++;
  }

  useEffect(() => {
    cancelAnimationFrame(animationRef.current);

    let start:number;
    const initialSize = size;
    const initialOpacity = opacity;
    const initialMoveX = moveX;
    const initialMoveY = moveY;
    const initialCornerRadius = cornerRadius;
    const duration = 100;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time-start) / duration, 1);

      setSize(initialSize + (targetSize-initialSize)*progress);
      setOpacity(initialOpacity + (targetOpacity-initialOpacity)*progress);
      setMoveX(initialMoveX + (targetMoveX-initialMoveX)*progress);
      setMoveY(initialMoveY + (targetMoveY-initialMoveY)*progress);
      setCornerRadius(initialCornerRadius + (targetCornerRadius-initialCornerRadius)*progress);

      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [expanded]);

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
    <rect
      x={x - size - moveX}
      y={y - offsetY.current - moveY}
      width={size}
      height={size}
      rx={cornerRadius*size}
      fill="#ADD8E6"
      fillOpacity={opacity}
      stroke="#F4F3FF"
      strokeWidth="1.5"
    />
    {expanded &&
    <ElementInput
      id={getNextId()}
      x={x - size - moveX + 5}
      y={y - offsetY.current - moveY + 5}
      width={size-10}
      height={size-10}
      elementFontSize={fontSize}
      fontSize={DEFAULT_OPTIONS_TEXT_SIZE}
      hasFocus={false}
      />
    }
    </g>
  );
}