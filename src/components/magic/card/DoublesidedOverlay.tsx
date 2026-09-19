'use client';

import { memo, PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  cardMousedover:boolean,
  node:HTMLDivElement|null,
  set:string,
  showFront:boolean,
  pointerDown:(e:React.PointerEvent<Element>, dir?: -1 | 1 | undefined) => void,
  pointerUp:PointerEventHandler,
};

const DoublesidedOverlay:React.FC<Props> = ({
  cardMousedover,
  node,
  set,
  showFront,
  pointerDown,
  pointerUp,
}) => {
  const [dims, setDims] = useState({ x:0, y:0, width: 0, height: 0 });

  useEffect(() => {
    if (!node) return;
  
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { x, y } = entry.target.getBoundingClientRect();
          
        setDims({
          x, y,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
  
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const tlaRatios = (dims:{width:number, height:number}) => {
    const circleSize = 55;
    const imgWidth = 670;
    const imgHeight = 935;
    const sizeRatio = circleSize/imgWidth;
    const topRatio = 46/imgHeight;
    const leftRatio = 39/imgWidth;
  
    return {
      x:dims.width*leftRatio,
      y:dims.height*topRatio,
      w:dims.width*sizeRatio,
      h:dims.width*sizeRatio,
    };
  };
  
  const khmRatios = (dims:{width:number, height:number}) => {
    const circleSize = 50;
    const imgWidth = 670;
    const imgHeight = 935;
    const sizeRatio = circleSize/imgWidth;
    const topRatio = 44/imgHeight;
    const leftRatio = 34.5/imgWidth;
  
    return {
      x:dims.width*leftRatio,
      y:dims.height*topRatio,
      w:dims.width*sizeRatio,
      h:dims.width*sizeRatio,
    };
  };

  const doubleSidedCircleOffset:{x:number, y:number, w:number, h:number} = useMemo(() => {
    const def = {x:0, y:0, w:0, h:0};
      
    if (!node) return def;
  
    return (set === 'tla') ? tlaRatios(dims) :
           (set === 'khm') ? khmRatios(dims) :
                             tlaRatios(dims);
  }, [dims, node]);

  return (
    <div 
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
      style={{
        borderRadius:'50%',
        position:'absolute',
        left:(showFront) ? doubleSidedCircleOffset.x + 'px' : `${dims.width - doubleSidedCircleOffset.w - doubleSidedCircleOffset.x}px`,
        top:doubleSidedCircleOffset.y + 'px',
        width:doubleSidedCircleOffset.w + 'px',
        height:doubleSidedCircleOffset.h + 'px',
        backgroundColor:'transparent',
        visibility:(cardMousedover) ? 'visible' : 'hidden',
        transition:'box-shadow 0.3s ease',
        boxShadow: (cardMousedover) ?
          '0px 0px 5px 5px rgba(236, 236, 26), inset 0px 0px 2px 3px rgba(236, 236, 26, 1)' :
          'none',
        cursor:'url("images/Cursor_Rotate.svg") 16 16, auto',
    }}/>
  );
};

export default memo(DoublesidedOverlay);