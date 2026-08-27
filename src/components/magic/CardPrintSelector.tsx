'use client'

import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragStage, useDragContext } from "../general/DragProvider";

const widthRatio = 578/669;
const heightRatio = 550/933;

const bulbSvg = (highlighted:boolean) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 42.333328 42.333328"
    version="1.1"
    filter={(highlighted) ?
      'drop-shadow(0 0px 10px rgba(253, 220, 92, 1))' :
      'drop-shadow(0 0px 10px rgba(0,0,0,1))'}
    id="svg1"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transition:'drop-shadow 0.3s ease-in-out',
    }}>
  <defs
     id="defs1">
    <linearGradient
       id="linearGradient14">
      <stop style={{
        stopColor:'#c862ae',
        stopOpacity:1,}}
        offset="0"
        id="stop13" />
      <stop style={{
        stopColor:'#d14821',
        stopOpacity:1}}
        offset="1"
        id="stop14" />
    </linearGradient>
    <linearGradient
       id="linearGradient8">
      <stop style={{
        stopColor:'#12870c',
        stopOpacity:1,}}
        offset="0"
        id="stop9" />
      <stop style={{
        stopColor:'#51ef49',
        stopOpacity:1}}
        offset="1"
        id="stop10" />
    </linearGradient>
    <linearGradient
       id="linearGradient7">
      <stop style={{
        stopColor:'#c862ae',
        stopOpacity:1,}}
        offset="0"
        id="stop7" />
      <stop style={{
        stopColor:'#d14821',
        stopOpacity:1,}}
        offset="1"
        id="stop8" />
    </linearGradient>
    <radialGradient
       xlinkHref="#linearGradient14"
       id="radialGradient8"
       cx="12.703321"
       cy="26.37644"
       fx="12.703321"
       fy="26.37644"
       r="17.232555"
       gradientTransform="matrix(1.7943261,0.00332945,-0.00203336,1.0958326,-11.063081,-9.2625424)"
       gradientUnits="userSpaceOnUse" />
    <linearGradient
       xlinkHref="#linearGradient8"
       id="linearGradient10"
       x1="6.2008405"
       y1="16.940947"
       x2="6.2008405"
       y2="4.7184033"
       gradientUnits="userSpaceOnUse" />
    <linearGradient
       xlinkHref="#linearGradient8"
       id="linearGradient11"
       gradientUnits="userSpaceOnUse"
       x1="6.2008405"
       y1="16.940947"
       x2="6.2008405"
       y2="4.7184033"
       gradientTransform="matrix(1,0,0,-1,0.06247617,42.504855)" />
    <radialGradient
       xlinkHref="#linearGradient7"
       id="radialGradient11"
       gradientUnits="userSpaceOnUse"
       gradientTransform="matrix(1.7943261,-0.00332945,-0.00203336,-1.0958326,-11.078387,51.689616)"
       cx="12.703321"
       cy="26.37644"
       fx="12.703321"
       fy="26.37644"
       r="17.232555" />
  </defs>
  <path style={{
     fill:'url(#radialGradient11)',
     fillRule:'evenodd',
     stroke:'#1d071a',
     strokeWidth:1.5,
     strokeLinecap:'round',
     strokeDasharray:'none',
     strokeOpacity:0.313343,}}
     d="m 0.2645833,21.166664 c 0,0 3.4276932,3.911509 6.2585071,7.608535 1.699995,2.220183 3.7786986,6.114204 5.8288996,6.418173 5.441616,0.806788 10.394568,-4.859464 14.078494,-8.9449 3.296221,-3.655475 7.965345,-5.081808 7.965345,-5.081808 z"
     id="path10"/>
  <path style={{
    fill:'url(#radialGradient8)',
    fillRule:'evenodd',
    stroke:'#1d071a',
    strokeWidth:1.5,
    strokeLinecap:'round',
    strokeDasharray:'none',
    strokeOpacity:0.313343,}}
    d="m 0.2645833,21.166664 c 0,0 3.4429986,-3.817764 6.2738125,-7.51479 1.699995,-2.220183 3.7786992,-6.1142042 5.8289002,-6.4181724 5.441616,-0.8067885 10.394568,4.8594634 14.078494,8.9448994 3.296221,3.655475 7.950039,4.988063 7.950039,4.988063 z"
    id="path5"/>
  <g id="layer1" />
  <path style={{
    fill:'none',
    fillOpacity:1,
    fillRule:'evenodd',
    stroke:'#1d071a',
    strokeWidth:1.5,
    strokeLinecap:'round',
    strokeDasharray:'none',
    strokeOpacity:0.313343}}
    d="m 0.2645833,21.166664 c 0,0 7.3698822,-7.465781 15.0584187,-7.467047 5.604328,-9.23e-4 7.272258,2.679286 11.023655,4.658021 3.66499,1.93316 8.049172,2.809026 8.049172,2.809026"
    id="path12"/>
  <path style={{
    fill:'none',
    fillOpacity:1,
    fillRule:'evenodd',
    stroke:'#1d071a',
    strokeWidth:1.5,
    strokeLinecap:'round',
    strokeDasharray:'none',
    strokeOpacity:0.313343}}
    d="m 0.26458333,21.166664 c 0,0 7.36988177,7.465781 15.05841867,7.467047 5.604328,9.23e-4 7.272258,-2.679286 11.023655,-4.658021 3.66499,-1.93316 8.049172,-2.809026 8.049172,-2.809026"
    id="path13"/>
  <path style={{
    fill:'url(#linearGradient11)',
    fillOpacity:1,
    fillRule:'evenodd',
    stroke:'#000000',
    strokeWidth:1.5,
    strokeLinecap:'round',
    strokeDasharray:'none',
    strokeOpacity:0.313343}}
    d="m 0.2645833,21.166664 c 0,0 1.1030097,6.157752 5.3061776,8.946301 6.2850721,4.169767 6.6000711,11.95578 6.6000711,11.95578 0,0 0.313793,-9.584813 -1.841167,-13.253476 C 8.2413527,25.260069 0.2645833,21.166664 0.2645833,21.166664 Z"
    id="path11"/>
  <path style={{
    fill:'url(#linearGradient10)',
    fillOpacity:1,
    fillRule:'evenodd',
    stroke:'#000000',
    strokeWidth:1.5,
    strokeLinecap:'round',
    strokeDasharray:'none',
    strokeOpacity:0.313343}}
    d="m 0.2645833,21.166664 c 0,0 1.0405334,-5.986225 5.2437013,-8.774774 C 11.793357,8.2221231 12.170832,0.2645833 12.170832,0.2645833 c 0,0 0.251317,9.7563397 -1.903643,13.4250027 -2.0883126,3.5552 -10.0026057,7.477078 -10.0026057,7.477078 z"
    id="path1"/>
</svg>
)

type Props = {
  location:string,
  func:(amount:number)=>void,
};
const CardPrintSelector:React.FC<Props> = ({
  location, func
}) => {
  const [highlighted, setHighlighted] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const lastMousePress = useRef<{x:number, y:number}|undefined>(undefined);
  const {subDrag} = useDragContext();

  useEffect(() => {
    const onDragStart = () => setDragging(true);
    const onDragEnd = () => setDragging(false);

    const unsubscribe = subDrag({tag:'card', onDragStart, onDragEnd});

    return unsubscribe;
  }, []);

  const left = useMemo(() => {
    return (location === 'right') ?
      `calc(100% + 5px)` :
      `calc(0% + 43px)`;
  }, [location]);

  const transform = useMemo(() => {
    const translate = 'translate(-50%, -50%)';
    const flip = 'rotate(180deg)';
    
    let final = (location === 'left') ?
      translate + ' ' + flip :
      translate;

    final = (highlighted) ?
      final + ' ' + 'scale(125%)' :
      final;

    final = (dragging) ?
      final + ' ' + 'scale(0%)' :
      final;

    return final;
  }, [location, highlighted, dragging]);

  const pointerEnter:PointerEventHandler = useCallback(() => {
    setHighlighted(true);
  }, []);

  const pointerLeave:PointerEventHandler = useCallback(() => {
    setHighlighted(false);
  }, []);

  const pointerDown:PointerEventHandler = useCallback((e:React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    lastMousePress.current = {x:e.clientX, y:e.clientY};
  }, []);

  const pointerUp:PointerEventHandler = useCallback((e:React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if ((lastMousePress.current) &&
        (lastMousePress.current.x === e.clientX) &&
        (lastMousePress.current.y === e.clientY))
      func((location === 'right') ? 1 : -1);

  }, [func])

  return (
    <div 
      onPointerEnter={pointerEnter}
      onPointerLeave={pointerLeave}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
        style={{
      width:`${72/669*100}%`,
      height:`${72/933*100}%`,
      position:'absolute',
      zIndex:50,
      borderRadius:'50%',
      top:`${heightRatio*100}%`,
      left:left,
      cursor:'pointer',
      transform:transform,
      transition:'transform 100ms ease-in-out',
      transformOrigin:'left',
    }}>
      {bulbSvg(highlighted)}
    </div>
  )
}

export default CardPrintSelector;