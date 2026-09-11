'use client'

import {PointerEventHandler, useRef, useState } from "react";

type Props = {
  polarity:boolean,
  setPolarity:(polarity:boolean)=>void,
  visible:boolean,
  offsets:{left:string, top:string},
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
const Polarity:React.FC<Props> = ({
  polarity,
  setPolarity,
  visible,
  offsets,
  options,
}) => {
  const [mousedOver, setMousedOver] = useState<boolean>(false);
  const pressed = useRef<boolean>(false);
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
      setPolarity(!polarity);
    }

    console.log('onPointerUp polarity', polarity);
  }

  const onXPointerEnter:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();
    setMousedOver(true);
  }

  const onXPointerLeave:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();
    setMousedOver(false);
    if(options && options.onPointerLeave)
      options.onPointerLeave(e);
  }

 return (<>
  <div className="polarity sub"
    onPointerEnter={onXPointerEnter}
    onPointerLeave={onXPointerLeave}
    onPointerDown={onXPointerDown}
    onPointerUp={onXPointerUp}
    style={{
      position:'absolute',
      left:offsets.left,
      top:offsets.top,
      width,
      height,
      padding:(options && options.padding) ? options.padding : '3px',
      cursor:'pointer',
      boxShadow:`0px 0px ${(mousedOver) ? 10 : 5}px white`,
      borderRadius:'50%',
      opacity:(visible) ? 1 : 0,
      background:(polarity) ? 'rgb(0, 115, 62)' :
                              'rgb(211, 38, 32)',
      transition:'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out, left 0.1s ease-in-out, top 0.1s ease-in-out',
      pointerEvents:(!visible) ? 'none' : 'auto',
      transform:(mousedOver) ? 'scale(130%)' : '',
      filter:(mousedOver) ? 'brightness(1.6)' : '',
      outline: '1px solid rgb(146, 148, 248)',
    }}>
    {(polarity) &&
    <svg xmlns="http://w3.org" width="100%" height="100%" viewBox="0 0 24 24"
      fill="none" stroke="rgb(146, 148, 248)" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" style={{
      pointerEvents:'none',
    }}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    }
    {(!polarity) &&
    <svg xmlns="http://w3.org" width="100%" height="100%" viewBox="0 0 24 24"
      fill="none" stroke="rgb(146, 148, 248)" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" style={{
      pointerEvents:'none',
    }}>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    }
  </div>
  </>);
};

export default Polarity;