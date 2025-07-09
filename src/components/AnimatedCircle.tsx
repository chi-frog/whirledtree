import { MouseEventHandler, RefObject, useEffect, useRef, useState } from "react";

type animatedCircleProps = {
  x:number,
  y:number,
  optionsOffsetY:RefObject<number>,
  optionsExpanded:boolean,
  handleMouseEnter:MouseEventHandler<SVGCircleElement>,
  handleMouseLeave:MouseEventHandler<SVGCircleElement>,
}

export default function AnimatedCircle({x, y, optionsOffsetY, optionsExpanded, handleMouseEnter, handleMouseLeave} : animatedCircleProps) {
  const [radius, setRadius] = useState(optionsExpanded ? 20 : 5);
  const targetRadius = optionsExpanded ? 20 : 5;
  const animationRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(animationRef.current);

    let start:number;
    const initial = radius;
    const duration = 200;

    function animate(time:number) {
      if (!start) start = time;

      const progress = Math.min((time-start) / duration, 1);
      const newRadius = initial + (targetRadius - initial) * progress;
      setRadius(newRadius);
      if (progress < 1)
        animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [optionsExpanded]);

  return (
    <circle
      cx={x - 7}
      cy={y - optionsOffsetY.current}
      r={radius}
      fill="lightblue"
      fillOpacity="0.7"
      stroke="blue"
      strokeWidth="2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}