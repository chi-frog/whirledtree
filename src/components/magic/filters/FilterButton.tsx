'use client'

import useTabVisibility from "@/hooks/useTabVisibility";
import { FocusEventHandler, memo, PointerEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import XOut from "./XOut";
import { FilterChangeFunction } from "@/hooks/magic/useFilters";

const defaultCoords = {x:-1, y:-1};

type SectionProps = {
  value:string,
  index:number,
  onChange:FilterChangeFunction<HTMLInputElement | HTMLSelectElement>
};
const Section: React.FC<SectionProps> = ({
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
    onHidden: () => inputRef.current?.blur()
  });

  const expanded = isTyping || mousedOver;

  const onPointerEnter: PointerEventHandler = () => {
    setMousedOver(true);
  };

  const onPointerLeave: PointerEventHandler = () => {
    setMousedOver(false);
  };

  useEffect(() => {
    if (isTyping && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  useEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setCircleWidth(entry.contentRect.height);
    });
    observer.observe(inputRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (expanded) {
      if (spanRef.current)
        setInputWidth(Math.max(spanRef.current.offsetWidth, circleWidth));
    } else if (circleWidth > 0) {
      setInputWidth(circleWidth);
    }
  }, [value, expanded, circleWidth]);

  const onBlur: FocusEventHandler<HTMLInputElement> = () => {
    setIsTyping(false);
    setMousedOver(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      let target: any = e.currentTarget;
      while (target && !(target instanceof HTMLFormElement))
        target = target.parentNode;
      if (target && target instanceof HTMLFormElement)
        target.requestSubmit();
    }
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e, index);
  };

  const onPointerDown: PointerEventHandler = (e) => {
    mouseCoords.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp: PointerEventHandler = (e) => {
    const dx = Math.abs(e.clientX - mouseCoords.current.x);
    const dy = Math.abs(e.clientY - mouseCoords.current.y);
    if (dx < 5 && dy < 5) {
      setIsTyping(true);
    }
  };

  return (<>
    <input key={index} className={(expanded) ? "fieldSizingContent" : "fieldSizingFixed"}
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
        color: expanded ? 'inherit' : 'transparent',
        caretColor: expanded ? 'auto' : 'transparent',
        backgroundColor:
          expanded ? 'white'
          : (value !== '') ? 'rgb(50, 50, 248)'
          : 'rgb(146, 148, 248)',
        aspectRatio: expanded ? '' : 1,
        height: expanded ? '40%' : '30%',
        width: `${inputWidth}px`,
        paddingLeft: '5px',
        paddingRight: '5px',
        textAlign: 'center',
        minWidth: `${circleWidth}px`,
        borderRadius: expanded ? '5px' : '50%',
        boxShadow:
          (mousedOver && !isTyping) ?
            'rgba(146, 148, 248, 0.4) 0px 0px 10px 2px inset' :
          (isTyping) ?
            'rgba(166, 168, 255, 1) 0px 0px 6px 2px inset' :
            'white 0px 0px 10px 2px inset',
        outline: '2px solid rgb(146, 148, 248)',
        transition: `border-radius 0.2s ease-in-out, background-color 0.2s ease-in-out, width ${isTyping ? 0 : 0.2}s ease-out, height ${isTyping ? 0 : 0.2}s ease-out`,
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
      {value || ' '}
    </span>
  </>);
};

type Props = {
  id:string,
  text:string,
  values:string[],
  onChange:FilterChangeFunction<HTMLInputElement | HTMLSelectElement>
};
const FilterButton:React.FC<Props> = ({
  id,
  text,
  values,
  onChange
}) => {
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const [sections, setSections] = useState<string[]>([]);

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
  };

  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      console.log('setIsTyping to a new one');

  };

  return (
  <div
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
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
      value={values.length > 0 ? values[0] : ''}
      index={0}
      onChange={onChange}/>
  </div>
)};

export default memo(FilterButton);