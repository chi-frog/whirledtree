'use client'

import { ChangeEventHandler, FocusEventHandler, memo, PointerEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";

const defaultCoords = {x:-1, y:-1};

type Props = {
  id:string,
  onChange:ChangeEventHandler
};
const FilterButton:React.FC<Props> = ({id, onChange}) => {
  const [mousedOver, setMousedOver] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [circleWidth, setCircleWidth] = useState(10);
  const [inputWidth, setInputWidth] = useState(circleWidth);
  const [liveText, setLiveText] = useState('');
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const savedText = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

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
      setIsTyping(true);

    const target = e.target;

    if ((target instanceof HTMLElement) &&
        (target.id !== id)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onPointerEnter:PointerEventHandler = () => {
    setMousedOver(true)
  };

  const onPointerLeave:PointerEventHandler = () => {
    setMousedOver(false)
  };

  const onBlur:FocusEventHandler<HTMLInputElement> = () => {
    setIsTyping(false);
    setMousedOver(false);
    if (!inputRef.current) return;

    const value = inputRef.current.value;
    savedText.current = value;
  }

  useEffect(() => {
    if (isTyping && inputRef.current)
      inputRef.current.focus();
  }, [isTyping]);

  useEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      console.log('set width', entry.contentRect.height);
      setCircleWidth(entry.contentRect.height);
    });
    observer.observe(inputRef.current);
    return () => observer.disconnect();
  }, []);

  const displayedText = isTyping ? liveText : (mousedOver ? savedText.current : '');

  useLayoutEffect(() => {
    if (mousedOver || isTyping) {
      if (spanRef.current)
        setInputWidth(Math.max(spanRef.current.offsetWidth, circleWidth));
    }
    else if (circleWidth > 0) {
      setInputWidth(circleWidth);
    }
  }, [displayedText, mousedOver, isTyping, circleWidth]);


  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLiveText(e.target.value);
    onChange(e);
  };

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

  return (
  <div
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerLeave={onPointerLeave}
    style={{
    borderRadius: '5px',
    maxHeight: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 5px 2px 5px',
    cursor: 'pointer',
    boxShadow: (mousedOver || isTyping) ? 'rgba(146, 148, 248, 0.4) 0px 0px 4px 2px inset' : '',
    outline: (mousedOver || isTyping) ? "1px solid rgba(146, 148, 248, 0.3)" : "1px solid rgba(146, 148, 248, 0)",
    transition: 'outline 0.2s ease-in-out',
    }}>
    <label htmlFor={id} 
      style={{
      marginRight: 5,
      fontWeight: 'bold',
      textWrap: 'nowrap',
      cursor:'pointer',
      whiteSpaceCollapse: 'preserve-spaces',
      }}>
        Oracle Text&nbsp;
    </label>
    <input id={id} name={id} className="fieldSizing" ref={inputRef}
      onPointerEnter={onPointerEnter}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onChange={onChangeInput}
      {...(isTyping && { value: liveText })}
      {...((mousedOver && !isTyping) && { value: savedText.current })}
      {...((!mousedOver && !isTyping) && { value: '' })}
      style={{
      backgroundColor:
        (mousedOver || isTyping) ?
          'white' :
        (savedText.current !== '') ?
          'rgb(50, 50, 248)' :
          'rgb(146, 148, 248)',
      aspectRatio: (mousedOver || isTyping) ? '' : 1,
      height: '60%',
      width: `${inputWidth}px`,
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
  </div>
)};

export default memo(FilterButton);