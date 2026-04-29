'use client'

import { _wpoint } from "@/helpers/wpoint";
import { MagicCard } from "./types/default";
import { _cardDragState, CardDragState, ImagePacket } from "./SearchResults";
import { useMemo, useRef } from "react";
import { DragStage, DragState } from "../general/DragProvider";

type Props = {
  dragState?:CardDragState,
  widthString:string,
  heightString?:string,
  imageHeightString?:string,
  card:MagicCard,
  imagePacket:ImagePacket|undefined,
  index:number,
  getRef?:(id:number, node:any) => () => void,
  handlePointerDown?:(e:React.PointerEvent) => void,
  handlePointerUp?:(e:React.PointerEvent) => void,
};
export const Card:React.FC<Props> = ({
    dragState,
    widthString,
    heightString,
    imageHeightString,
    card,
    imagePacket,
    index,
    getRef,
    handlePointerDown,
    handlePointerUp,
  }:Props) => {
  const cardRef = useRef<null|HTMLDivElement>(null);

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

  const handleCardPointerEnter = (e:React.PointerEvent) => {
    const element = cardRef.current;
    if (!element) return;

    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;
    element.style.border = "1px solid rgb(146, 148, 248)";
    element.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging)
      element.style.top = "-3px";

    let raf:number;

    const change = () => {
      if (element.style.boxShadow === 'none') {
        cancelAnimationFrame(raf);
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

      element.style.boxShadow = (dragState && dragState.stage === DragStage.ACTIVE) ?
        `0px 0px 15px 10px rgba(146, 255, 248, ${opacity})` :
        `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;

      raf = requestAnimationFrame(change);
    };

    raf = requestAnimationFrame(change);
  };

  const handleCardPointerLeave = (e:React.PointerEvent) => {
    const element = cardRef.current;
    if (!element) return;

    element.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    element.style.boxShadow = "none";
    element.style.position = "auto";
    element.style.top = "";
  };

  //{...(getRef && { ref: getRef.bind(null, index) })}

  return (
    <div
      ref={cardRef}
      onPointerEnter={(e)=>handleCardPointerEnter(e)}
      onPointerLeave={(e)=>handleCardPointerLeave(e)}
      onPointerDown={(e) => handlePointerDown && handlePointerDown(e)}
      onPointerUp={(e) => handlePointerUp && handlePointerUp(e)} style={{
        display:'flex',
        cursor:'hand',
        flexDirection:'column',
        margin:'5px',
        overflow:'hidden',
        borderRadius:'12px',
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