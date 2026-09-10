'use client'

import { PointerEventHandler, useRef, useState } from "react";

type Props = {
  cancel:()=>void,
  visible:boolean,
  offsets:{left:string, top:string},
  animateOffsets?:{left:number, top:number},
  options?:{
    animated?:boolean,
    width?:string,
    height?:string,
    padding?:string,
    xWidth?:string,
    xHeight?:string,
    onPointerLeave?:PointerEventHandler,
  },
};
const XOut:React.FC<Props> = ({
  cancel,
  visible,
  offsets,
  animateOffsets,
  options,
}) => {
  const [mousedOver, setMousedOver] = useState<boolean>(false);
  const pressed = useRef<boolean>(false);
  const animated = (options && options.animated);
  const width = (options && options.width) ? options.width : '25px';
  const height = (options && options.height) ? options.height : '25px';

  const onXPointerDown:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();

    pressed.current = true;
  }

  const onXPointerUp:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();

    if (pressed.current) {
      pressed.current = false;
      cancel();
    }

    console.log('onPointerUp XOut');
  }

  const onXPointerEnter:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();
    setMousedOver(true);
  }

  const onXPointerLeave:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();
    setMousedOver(false);
  }

 return (<>
  <div className="caller xOut sub"
    onPointerEnter={onXPointerEnter}
    onPointerLeave={onXPointerLeave}
    style={{
      position:'absolute',
      left:offsets.left,
      top:offsets.top,
      background:'transparent',
      width,
      height,
      borderRadius:'50%',
      zIndex:45,
      outline:'1px solid black',
    }}>
    <div className="xOut sub"
      onPointerDown={onXPointerDown}
      onPointerUp={onXPointerUp}
      onPointerLeave={options?.onPointerLeave}
      style={{
        position:'absolute',
        background:'black',
        left:(mousedOver || !animateOffsets) ?
          0 :
          parseInt(offsets.left) - animateOffsets.left,
        top:(mousedOver || !animateOffsets) ?
          0 :
          parseInt(offsets.top) - animateOffsets.top,
        width:
          (options && options.xWidth) ? options.xWidth :
          (mousedOver || !animated)   ? width :
                                        `calc(${width} - 5px)`,
        height:
          (options && options.xHeight) ? options.xHeight :
          (mousedOver || !animated)    ? height :
                                      `calc(${height} - 5px)`,
        padding:(options && options.padding) ? options.padding : '3px',
        cursor:'pointer',
        boxShadow:`0px 0px ${(mousedOver) ? 10 : 5}px white`,
        borderRadius:'50%',
        opacity:(visible) ? 1 : 0,
        transition:'box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out, left 0.1s ease-in-out, top 0.1s ease-in-out',
        pointerEvents:(!visible) ? 'none' : 'auto',
      }}>
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
        opacity:(mousedOver || !animated) ? 1 : 0,
        transition:(animated) ? 'opacity 0.1s ease-in-out' :
                                '',
        pointerEvents:'none',
      }}>
        <line x1="5" y1="5" x2="19" y2="19" stroke="rgb(255, 88, 90)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="19" y1="5" x2="5" y2="19" stroke="rgb(255, 88, 90)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  </div></>);
};

export default XOut;