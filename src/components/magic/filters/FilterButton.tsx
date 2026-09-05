'use client'

import useTabVisibility from "@/hooks/useTabVisibility";
import { ChangeEventHandler, FocusEventHandler, memo, PointerEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import XOut from "./XOut";

const defaultCoords = {x:-1, y:-1};

type SectionProps = {
  value:string,
  index:number,
  onChange:ChangeEventHandler
};
const Section:React.FC<SectionProps> = ({
  value,
  index,
  onChange
}) => {
  const [mousedOver, setMousedOver] = useState<boolean>(false);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [circleWidth, setCircleWidth] = useState(10);
  const [inputWidth, setInputWidth] = useState(circleWidth);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useTabVisibility({
    onHidden:() => inputRef.current?.blur()
  })

  const displayedText = (isTyping || mousedOver) ? value : '';

  const onPointerEnter:PointerEventHandler = () => {
    setMousedOver(true);
  }

  const onPointerLeave:PointerEventHandler = () => {
    setMousedOver(false);
    setIsTyping(false);
  }

  useEffect(() => {
    if (isTyping && inputRef.current)
      inputRef.current.focus();
  }, [isTyping]);

  useEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setCircleWidth(entry.contentRect.height);
      console.log('Reset Circle Width:' + entry.contentRect.height);
    });
    observer.observe(inputRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (mousedOver || isTyping) {
      if (spanRef.current)
        setInputWidth(Math.max(spanRef.current.offsetWidth, circleWidth));
    }
    else if (circleWidth > 0) {
      setInputWidth(circleWidth);
    }
  }, [displayedText, mousedOver, isTyping, circleWidth]);

  const onBlur:FocusEventHandler<HTMLInputElement> = () => {
    setIsTyping(false);
    setMousedOver(false);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (e.target instanceof HTMLInputElement)) {
      e.preventDefault();

      let target:any = e.currentTarget;

      while ((target) && !(target instanceof HTMLFormElement))
        target = target.parentNode;

      if (target && target instanceof HTMLFormElement)
        target.requestSubmit();
    }
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    console.log('Firing on change', e);
  };

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
    console.log('pointer down');
  };

  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      setIsTyping(true);
      console.log('pointer up');
  };

  console.log('mouseover:' + mousedOver + ' isTyping:' + isTyping);

  return (<>
    <input key={index} className="fieldSizing"
      ref={inputRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onChange={onChangeInput}
      value={value}
      style={{
      backgroundColor:
        (mousedOver || isTyping) ?
          'white' :
        (value[0] !== '') ?
          'rgb(50, 50, 248)' :
          'rgb(146, 148, 248)',
      aspectRatio: (mousedOver || isTyping) ? '' : 1,
      height: (mousedOver || isTyping) ? '40%' : '30%',
      width: (mousedOver || isTyping) ? `${inputWidth}px` : 'auto',
      paddingLeft: '5px',
      paddingRight: '5px',
      textAlign: 'center',
      minWidth: `${circleWidth}px`,
      borderRadius:
        (mousedOver || isTyping) ?
          '5px' :
          '50%',
      boxShadow:
        (mousedOver && !isTyping) ?
          'rgba(146, 148, 248, 0.4) 0px 0px 10px 2px inset' : 
        (isTyping) ?
          'rgba(166, 168, 255, 1) 0px 0px 6px 2px inset' :
          'white 0px 0px 10px 2px inset',
      outline: '2px solid rgb(146, 148, 248)',
      transition: `border-radius 0.2s ease-in-out, background-color 0.3s ease-in-out, width ${isTyping ? '0s' : '0.2s'} ease-out`,
    }}/>
    <span
      ref={spanRef}
      style={{
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre',
      textAlign: 'center',
      paddingLeft: '5px',
      paddingRight: '5px',
      font: 'inherit', 
      }}>
      {displayedText || ' '}
    </span>
  </>);
};

type Props = {
  id:string,
  text:string,
  value:string[],
  onChange:ChangeEventHandler
};
const FilterButton:React.FC<Props> = ({id, text, value, onChange}) => {
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
    
    const target = e.target;

    if ((target instanceof HTMLElement) &&
        (target.id !== id)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      console.log('setIsTyping to a new one');

    const target = e.target;

    if ((target instanceof HTMLElement) &&
        (target.id !== id)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onPointerLeave:PointerEventHandler = () => {
    // mouseover false
    console.log('MOUSEOVER TO FALSE');
  };

  return (
  <div
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerLeave={onPointerLeave}
    style={{
    color:'black',
    borderRadius: '5px',
    maxHeight: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 5px 2px 5px',
    cursor: 'pointer',
    zIndex:1,
    }}>
    <label htmlFor={id} 
      style={{
      marginRight: 5,
      color:'white',
      fontWeight: 'bold',
      textWrap: 'nowrap',
      cursor:'pointer',
      whiteSpaceCollapse: 'preserve-spaces',
      }}>
      {text}&nbsp;
    </label>
    <Section
      value={value[0]}
      index={0}
      onChange={onChange}/>
  </div>
)};

export default memo(FilterButton);