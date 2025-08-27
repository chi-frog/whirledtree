'use client'

import { useEffect, useRef, useState } from "react";

type cursorProps = {
  x:number,
  y:number,
  width:number,
  height:number,
}

export default function Cursor({x, y, width, height} : cursorProps) {
    const opacitySwitch = useRef(true);
    const [opacity, setOpacity] = useState(opacitySwitch.current ? 0 : 1);
    const targetOpacity = opacitySwitch.current ? 1 : 0;
    const animationRef = useRef(0);

    useEffect(() => {
      cancelAnimationFrame(animationRef.current);
  
      let start:number;
      const initialOpacity = opacity;
      const duration = 500;
  
      function animate(time:number) {
        if (!start) start = time;
  
        const progress = Math.min((time-start) / duration, 1);
        const progressCubicEaseInOut = Math.pow(progress, 2) * 3 - Math.pow(progress, 3) * 2;
        const opacity = initialOpacity + (targetOpacity-initialOpacity)*progressCubicEaseInOut;

        setOpacity(opacity);
  
        if (progress < 1)
          animationRef.current = requestAnimationFrame(animate);
        else {
          opacitySwitch.current = !opacitySwitch.current;
          animationRef.current = requestAnimationFrame(animate);
        }
      }
  
      animationRef.current = requestAnimationFrame(animate);
  
      return () => cancelAnimationFrame(animationRef.current);
    }, [opacitySwitch.current]);

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 70.555555 282.22222"
      version="1.1"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg">
    <defs
      id="defs1" />
    <g
      id="layer1">
      <path
         style={{
          baselineShift:"baseline",
          display:"inline",
          overflow:"visible",
          opacity:opacity,
          vectorEffect:"none",
          strokeLinejoin:"round",
          stopColor:"#000000",
          stopOpacity:1}}
       d="m 59.939453,0 c 0,0 -11.078451,-0.11918074 -21.794922,6.5800781 -10.71647,6.6992589 -20.729956,22.0530289 -20.503906,42.3007809 0.07803,6.989615 0.03053,175.873621 0,184.470701 -0.172214,48.49934 -7.01953,48.8711 -7.01953,48.8711 0,0 11.05028,0.0644 21.628906,-6.64063 10.578626,-6.70507 20.452208,-21.73746 20.666016,-41.85547 0.133061,-12.52029 0.01536,-173.616735 0,-185.240232 C 52.851773,-0.13418327 59.939453,0 59.939453,0 Z"
       id="path3" />
    </g>
    </svg>
  );
}