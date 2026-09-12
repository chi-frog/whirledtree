'use client'

import useTabVisibility from "@/hooks/useTabVisibility";
import { FocusEventHandler, memo, PointerEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import XOut from "./XOut";
import { FilterChangeFunction, SelectedSection } from "@/hooks/magic/useFilters";
import Polarity from "./Polarity";

const colorWheel:string[] = [
  'rgb(248, 231, 185)',
  'rgb(179, 206, 234)',
  'rgb(166, 159, 157)',
  'rgb(235, 159, 130)',
  'rgb(196, 211, 202)',
]

const defaultCoords = {x:-1, y:-1};

type SectionProps = {
  section:SelectedSection,
  index:number,
  last:boolean,
  visible:boolean,
  onChange:FilterChangeFunction,
};
const Section:React.FC<SectionProps> = memo(({
  section,
  index,
  last,
  visible,
  onChange,
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

  const expanded = (isTyping || mousedOver) || (visible);

  const onPointerEnter: PointerEventHandler = () => {
    setMousedOver(true);
  };

  const onPointerLeave: PointerEventHandler = (e:React.PointerEvent) => {
    if (!(e.relatedTarget) ||
        !((e.relatedTarget as HTMLElement).className) ||
        !(e.relatedTarget as HTMLElement).className.includes('sub' + index))
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
  }, [section.value, expanded, circleWidth]);

  const onBlur:FocusEventHandler<HTMLInputElement> = () => {
    setIsTyping(false);
    setMousedOver(false);
  };

  const onFocus:FocusEventHandler<HTMLInputElement> = () => {
    setIsTyping(true);
  }

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
    onChange({value:e.target.value}, index);
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
    console.log('onPointerUp FilterSection');
  };

  return (<div style={{
    height:'100%',
    position:'relative',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
  }}>
    {!last && <XOut
      cancel={()=>{
        onChange({value:''}, index);
      }}
      visible={expanded}
      offsets={{left:'-8px', top:'calc(50% - 22px)'}}
      index={index}
      options={{
        animated:true,
        width:'14px',
        height:'14px',
        padding:'1px',
        onPointerLeave:() => {
          setMousedOver(false);
        }
      }}/>}
    {!last && <Polarity
      polarity={section.polarity}
      setPolarity={(polarity:boolean) => onChange({polarity}, index)}
      visible={expanded}
      offsets={{left:'-7px', top:'calc(50% + 7px)'}}
      index={index}
      options={{
        animated:true,
        width:'14px',
        height:'14px',
        padding:'1px',
        onPointerLeave:() => {
          setMousedOver(false);
        }
      }}/>}
    <input className={(expanded) ? "fieldSizingContent" : "fieldSizingFixed"}
      ref={inputRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
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
      {section.value ? section.value :  ' '}
    </span>
  </div>);
});

type Props = {
  id:string,
  text:string,
  sections:SelectedSection[],
  onChange:FilterChangeFunction,
};
const FilterButton:React.FC<Props> = ({
  id,
  text,
  sections,
  onChange
}) => {
  const [allVisible, setAllVisible] = useState<boolean>(false);
  const mouseCoords = useRef<{x:number, y:number}>(defaultCoords);
  const [mousedOver, setMousedOver] = useState<boolean>(false);

  const onPointerDown:PointerEventHandler = (e) => {
    mouseCoords.current = {x:e.clientX, y:e.clientY};
    console.log('DOWN');
  };

  const onPointerUp:PointerEventHandler = (e) => {
    if ((mouseCoords.current.x === e.clientX) &&
        (mouseCoords.current.y === e.clientY))
      setAllVisible((prev) => !prev);
    console.log('onPointerUp FilterButton');
  };

  const onPointerEnter:PointerEventHandler = () => {
    setMousedOver(true);
  }

  const onPointerLeave:PointerEventHandler = () => {
    setMousedOver(false);
  }

  return (
  <div
    style={{
    color:'black',
    borderRadius: '5px',
    maxHeight: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 5px 2px 5px',
    zIndex:1,
    }}>
    <label
      htmlFor={id} 
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{
      marginRight: 2,
      padding:5,
      color:'white',
      fontWeight: 'bold',
      textWrap: 'nowrap',
      cursor:'pointer',
      borderRadius:5,
      whiteSpaceCollapse: 'preserve-spaces',
      boxShadow:(mousedOver) ? '0px 0px 8px white inset, 0px 0px 4px white' : '',
      }}>
      {text}&nbsp;
    </label>
    {sections.map((_section, _index) => {
      return (
        <Section
          key={_index}
          section={_section}
          index={_index}
          last={_index === (sections.length - 1)}
          visible={allVisible}
          onChange={onChange}/>
      );
    })}
  </div>
)};

export default memo(FilterButton);