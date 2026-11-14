'use client'

import { SelectedSection, SelectionChangeFunction } from "@/hooks/magic/useSelection";
import useTabVisibility from "@/hooks/useTabVisibility";
import { memo, useState, useRef, useEffect, PointerEventHandler, useLayoutEffect, FocusEventHandler } from "react";
import Polarity from "./Polarity";
import XOut from "./XOut";
import { colorWheel, defaultCoords } from "./FilterButton";

type SectionProps = {
  section:SelectedSection,
  previousConnector:'and'|'or',
  index:number,
  last:boolean,
  buttonMousedover:boolean,
  visible:boolean,
  onChange:SelectionChangeFunction,
  validateChange?:(input:string)=>any,
};
const Section:React.FC<SectionProps> = memo(({
  section,
  previousConnector,
  index,
  last,
  buttonMousedover,
  visible,
  onChange,
  validateChange = (input:string) => true,
}) => {
  const [mousedover, setMousedover] = useState<boolean>(false);
  const [shown, setShown] = useState<boolean>(false);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [circleWidth, setCircleWidth] = useState(10);
  const [inputWidth, setInputWidth] = useState(circleWidth);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!buttonMousedover)
      setShown(false)
  }, [buttonMousedover]);

  useTabVisibility({
    onHidden: () => inputRef.current?.blur()
  });

  const expanded = isTyping || shown || (visible && !last);

  const onPointerEnter: PointerEventHandler = () => {
    setMousedover(true);
    setShown(true)
  };

  const onPointerLeave: PointerEventHandler = () => {
    setMousedover(false);
    if (last)
      setShown(false)
  }

  useEffect(() => {
    if (isTyping && inputRef.current && document.activeElement !== inputRef.current)
      inputRef.current.focus();
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
    setInputWidth(
      ((expanded) && (spanRef.current)) ?
        Math.max(spanRef.current.offsetWidth, circleWidth) :
        circleWidth);
  }, [section.value, expanded, circleWidth]);

  const onBlur:FocusEventHandler<HTMLInputElement> = () =>
    setIsTyping(false);

  const onFocus:FocusEventHandler<HTMLInputElement> = () =>
    setIsTyping(true);

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

  // Dont want to forget - AI reminded me about this for accessibility
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const validationData = validateChange(value);

    if (validationData) {
      console.log("validationData", validationData)
      if (validationData.operator)
        onChange({value, operator:validationData.operator}, index);
      else
        onChange({value}, index);
    } else if (!prefersReducedMotion())
      inputRef.current?.animate(
      [
        { transform: 'translateX(0)', outline:'2px solid rgb(235, 103, 130)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 300, easing: 'ease-in-out' });
  };

  const onPointerDown: PointerEventHandler = (e) => {
    mouseCoords.current = {x: e.clientX, y: e.clientY};
  };

  const onPointerUp: PointerEventHandler = (e) => {
    const dx = Math.abs(e.clientX - mouseCoords.current.x);
    const dy = Math.abs(e.clientY - mouseCoords.current.y);
    if (dx < 5 && dy < 5) {
      setIsTyping(true);
    }
  };

  return (<div
    onPointerEnter={onPointerEnter}
    onPointerLeave={onPointerLeave}
    style={{
      height:'100%',
      position:'relative',
      display:'flex',
      paddingLeft:
        (last || (previousConnector === 'or')) ? '5px' :
                                                 '0px',
      paddingRight:(section.connector === 'and') ? '0px' : '5px',
      justifyContent:'center',
      alignItems:'center',
      transition:'padding-left 0.2s ease-in-out, padding-right 0.2s ease-in-out',
    }}>
    <div
      style={{
        display:'flex',
        flexDirection:'column',
        position:'relative',
        width:'0px',
      }}>
      {!last && <XOut
        cancel={()=>{
          onChange({value:''}, index);
        }}
        visible={expanded && mousedover}
        offsets={{left:'-6px', top:'-8px'}}
        index={index}
        options={{
          animated:true,
          width:'16px',
          height:'16px',
          padding:'1px',
      }}/>}
      {!last && <Polarity
        polarity={section.polarity}
        setPolarity={(polarity:boolean) => onChange({polarity}, index)}
        visible={expanded && mousedover}
        offsets={{left:'-7px', top:'8px'}}
        index={index}
        options={{
          animated:true,
          width:'14px',
          height:'14px',
          padding:'1px',
        }}/>}
    </div>
    <input className={(expanded) ? "fieldSizingContent" : "fieldSizingFixed"}
      title={(section.value !== '') ? 'Edit Section' : 'Add New Section'}
      ref={inputRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={onChangeInput}
      value={section.value}
      style={{
        color: expanded ? 'inherit' : 'transparent',
        caretColor: expanded ? 'auto' : 'transparent',
        backgroundColor:
          (expanded) ?     'white' :
          (section.value !== '') ? colorWheel[index%colorWheel.length] :
                                   'rgb(146, 148, 248)',
        aspectRatio: expanded ? '' : 1,
        height: (expanded) ? '40%' :
                (last)     ? '20%' :
                             '30%',
        width: `${inputWidth}px`,
        paddingLeft: '5px',
        paddingRight: '5px',
        textAlign: 'center',
        minWidth: `${circleWidth}px`,
        borderRadius: expanded ? '5px' : '50%',
        boxShadow:
          (mousedover && !isTyping) ?
            'rgba(146, 148, 248, 0.4) 0px 0px 10px 2px inset' :
          (isTyping) ?
            'rgba(166, 168, 255, 1) 0px 0px 6px 2px inset' :
            'white 0px 0px 10px 2px inset',
        outline: (!section.polarity) ? '3px solid rgb(235, 103, 130)' : '2px solid rgb(146, 148, 248)',
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
      {section.value ? section.value :  ' '}
    </span>
  </div>);
});

export default Section;