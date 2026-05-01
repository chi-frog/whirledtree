'use client'

import { _wpoint } from "@/helpers/wpoint";
import { MagicCard } from "./types/default";
import { _cardDragState, CardDragState, ImagePacket } from "./SearchResults";
import { useCallback, useMemo, useRef } from "react";
import { DragStage } from "../general/DragProvider";

export type CardLocation =
  'view' | 'modal';
type Props = {
  location:CardLocation,
  dragState?:CardDragState,
  widthString:string,
  heightString?:string,
  imageHeightString?:string,
  card:MagicCard,
  imagePacket:ImagePacket|undefined,
  handlePointerDown?:(e:React.PointerEvent) => void,
  handlePointerUp?:(e:React.PointerEvent) => void,
};
export const Card:React.FC<Props> = ({
    location,
    dragState,
    widthString,
    heightString,
    imageHeightString,
    card,
    imagePacket,
    handlePointerDown,
    handlePointerUp,
  }:Props) => {
  const cardRef = useRef<null|HTMLDivElement>(null);
  const raf = useRef<number>(-1);

  const imageSrc = useMemo(() =>
    (!imagePacket)          ? undefined :
    (imagePacket.largeBlob) ? imagePacket.largeBlob :
                              imagePacket.smallBlob
  , [imagePacket]);

  const x = useMemo(() => 
    (dragState) ? (dragState.point.x - dragState.start.x) : 0, [dragState]);
  const y = useMemo(() =>
    (dragState) ? (dragState.point.y - dragState.start.y) : 0, [dragState]);
  const angle = useMemo(() =>
    (dragState) ? (dragState.angle) : 0, [dragState]);
  const dragging = useMemo(() =>
    (dragState) ? (dragState.stage === DragStage.ACTIVE) : 0, [dragState?.stage]);

  const glow = useCallback((version:boolean) => {
    const element = cardRef.current;
    if (!element) return;

    cancelAnimationFrame(raf.current);

    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;
    element.style.border = "1px solid rgb(146, 148, 248)";
    element.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging && (location === 'view'))
      element.style.top = "-3px";

    const change = () => {
      if (element.style.boxShadow === 'none') {
        cancelAnimationFrame(raf.current);
        return;
      }

      if(opacityGoingUp) {
        opacity += (opacityFirstPass) ? opacityRate*15 : opacityRate;
        if (opacity >= 1) {
          opacityGoingUp = false;
          opacityFirstPass = false;
        }
      } else {
        opacity -= opacityRate;
        if (opacity <= 0.7)
          opacityGoingUp = true;
      }

      const selectedBoxShadow = `0px 0px 15px 10px rgba(146, 255, 248, ${opacity})`;
      const mouseoverBoxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;

      element.style.boxShadow = (version) ?
        selectedBoxShadow:
        mouseoverBoxShadow;

      raf.current = requestAnimationFrame(change);
    };

    raf.current = requestAnimationFrame(change);

    return () => cancelAnimationFrame(raf.current);
  }, []);

  const handleCardPointerEnter = (e:React.PointerEvent) => {
    glow(false);
  };

  const handleCardPointerLeave = (e:React.PointerEvent) => {
    const element = cardRef.current;
    if (!element) return;

    element.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    element.style.boxShadow = "none";
    element.style.position = "auto";
    element.style.top = "";
  };

  const handleCardPointerDown = (e:React.PointerEvent) => {
    if (handlePointerDown)
      handlePointerDown(e);
    glow(true);
  }

  const handleCardPointerUp = (e:React.PointerEvent) => {
    if (handlePointerUp)
      handlePointerUp(e);
    glow(false);
  }

  //{...(getRef && { ref: getRef.bind(null, index) })}

  return (
    <div
      ref={cardRef}
      onPointerEnter={(e)=>handleCardPointerEnter(e)}
      onPointerLeave={(e)=>handleCardPointerLeave(e)}
      onPointerDown={(e) => handleCardPointerDown(e)}
      onPointerUp={(e) => handleCardPointerUp(e)} style={{
        display:'flex',
        cursor:'hand',
        flexDirection:'column',
        margin:(location === 'view') ? '5px' : '0px',
        overflow:'hidden',
        borderRadius:(location ==='view') ? '12px' : '20px',
        border:'1px solid rgba(255, 255, 255, 0.7)',
        minWidth:'20px',
        transform:(dragState && dragState.stage !== DragStage.INACTIVE) ?
          `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          '',
        width:widthString,
        height:heightString,
        position: 'relative',
        zIndex: (dragState && dragState.stage !== DragStage.INACTIVE) ? 30 : 0,
        }}>
      <img src={imageSrc} draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        cursor:'pointer',
        marginTop:'auto',
        }}/>
    </div>);
};