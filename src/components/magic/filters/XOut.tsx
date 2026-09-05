'use client'

import { PointerEventHandler, useRef, useState } from "react";

type Props = {
  cancel:()=>void,
  visible:boolean,
  offsets:{left:number, top:number},
  animateOffsets?:{left:number, top:number},
  options?:{
    animated?:boolean
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
  const animated = (options && options.animated)

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
  }

  const onXPointerEnter:PointerEventHandler = () => {
    setMousedOver(true);
  }

  const onXPointerLeave:PointerEventHandler = () => {
    setMousedOver(false);
  }

 return (<>
  <div className="caller"
    onPointerEnter={onXPointerEnter}
    onPointerLeave={onXPointerLeave}
    style={{
      position:'absolute',
      left:offsets.left,
      top:offsets.top,
      background:'transparent',
      width:'25px',
      height:'25px',
      borderRadius:'50%',
      zIndex:45,
      outline:'1px solid black',
    }}>
    <div className="xOut"
      onPointerDown={onXPointerDown}
      onPointerUp={onXPointerUp}
      style={{
        position:'absolute',
        background:'black',
        left:(mousedOver || !animateOffsets) ?
          offsets.left :
          offsets.left - animateOffsets.left,
        top:(mousedOver || !animateOffsets) ?
          offsets.top :
          offsets.top - animateOffsets.top,
        width:(mousedOver) ? '23px' : '20px',
        height:(mousedOver) ? '23px' : '20px',
        padding:'3px',
        cursor:'pointer',
        boxShadow:'0px 0px 10px white',
        borderRadius:'50%',
        opacity:(visible) ? 1 : 0,
        transition:'opacity 0.3s ease-in-out, left 0.1s ease-in-out, top 0.1s ease-in-out',
        pointerEvents:(!visible) ? 'none' : 'auto',
      }}>
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
        opacity:(mousedOver) ? 1 : 0,
        transition:'opacity 0.1s ease-in-out',
      }}>
        <line x1="5" y1="5" x2="19" y2="19" stroke="rgb(255, 88, 90)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="19" y1="5" x2="5" y2="19" stroke="rgb(255, 88, 90)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  </div></>);
};

export default XOut;