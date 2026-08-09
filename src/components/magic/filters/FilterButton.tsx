'use client'

import { FocusEventHandler, memo, PointerEventHandler, useEffect, useRef, useState } from "react";

const defaultCoords = {x:-1, y:-1};

type Props = {

};
const FilterButton:React.FC<Props> = () => {
  const [mousedOver, setMousedOver] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [minInputWidth, setMinInputWidth] = useState<number>(10);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
  };

  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      setIsTyping(true);
  };

  const onBlur:FocusEventHandler<HTMLInputElement> = (e) => {
    setIsTyping(false);
  }

  useEffect(() => {
    if (isTyping && inputRef.current)
      inputRef.current.focus();
  }, [isTyping]);

  useEffect(() => {
    const box = inputRef.current?.getBoundingClientRect();
    if (box)
      setMinInputWidth(box.height);
  }, [mousedOver]);

  return (
    <div
      onPointerEnter={()=>setMousedOver(true)}
      onPointerLeave={()=>setMousedOver(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
      borderRadius:'5px',
      maxHeight:'100%',
      height:'100%',
      display:'flex',
      alignItems:'center',
      padding:'2px 5px 2px 5px',
      cursor:'pointer',
    }}>
      <h3 style={{
        marginRight:5,
        fontWeight:'bold',
        textWrap:'nowrap',
        whiteSpaceCollapse:'preserve-spaces',
        textShadow:(mousedOver) ? '1px 1px 5px rgba(146, 148, 248, .8)' : '',
      }}>
        Oracle Text&nbsp;
      </h3>
      <input className="fieldSizing" ref={inputRef} style={{
        backgroundColor:'rgb(146, 148, 248)',
        aspectRatio:(mousedOver) ? '' : 1,
        height:'60%',
        width:'fit-content',
        minWidth:(mousedOver) ? `${minInputWidth}px` : '',
        borderRadius:(mousedOver) ? '5px' : '50%',
        boxShadow:'white 0px 0px 10px 2px inset',
        outline:'2px solid rgb(146, 148, 248)',
        transition:'border-radius 0.3s ease-in-out',
      }}>
        
      </input>
    </div>
  );
};

export default memo(FilterButton);