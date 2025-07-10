import { MouseEventHandler, RefObject, useEffect, useRef, useState } from "react";

type animatedCircleProps = {
  x:number,
  y:number,
  optionsOffsetY:RefObject<number>,
  optionsExpanded:boolean,
  handleMouseEnter:MouseEventHandler<SVGRectElement>,
  handleMouseLeave:MouseEventHandler<SVGRectElement>,
}

export default function AnimatedCircle({x, y, optionsOffsetY, optionsExpanded, handleMouseEnter, handleMouseLeave} : animatedCircleProps) {
  const [size, setSize] = useState(optionsExpanded ? 40 : 10);
  const [opacity, setOpacity] = useState(optionsExpanded ? 1 : 0.7);
  const [moveX, setMoveX] = useState(optionsExpanded ? 20 : 0);
  const [moveY, setMoveY] = useState(optionsExpanded ? 20 : 0);
  const [cornerRadius, setCornerRadius] = useState(optionsExpanded ? size : 5);
  const targetSize = optionsExpanded ? 40 : 10;
  const targetOpacity = optionsExpanded ? 1 : 0.7;
  const targetMoveX = optionsExpanded ? -2 : 0;
  const targetMoveY = optionsExpanded ? 28 : 0;
  const targetCornerRadius = optionsExpanded ? 0.1 : 0.5;
  const animationRef = useRef(0);

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
  }, [optionsExpanded]);

  return (
    <g>
    <rect
      x={x - size - moveX}
      y={y - optionsOffsetY.current - moveY}
      width={size}
      height={size}
      rx={cornerRadius*size}
      fill="blue"
      fillOpacity={opacity}
      stroke="#F4F3FF"
      strokeWidth="1.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
    </g>
  );
}