'use client'

import { _wpoint } from "@/helpers/wpoint";
import { MagicCard } from "./types/default";
import { _cardDragState, CardDragState, ImagePacket } from "./SearchResults";
import { useMemo } from "react";
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
  handlePointerEnter?:(e:React.PointerEvent) => void,
  handlePointerLeave?:(e:React.PointerEvent) => void,
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
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
  }:Props) => {

  if (!dragState) dragState = _cardDragState;

  const imageSrc = useMemo(() =>
    (!imagePacket)          ? undefined :
    (imagePacket.largeBlob) ? imagePacket.largeBlob :
                              imagePacket.smallBlob
  , [imagePacket]);

  const x = useMemo(() => dragState.point.x - dragState.start.x, [dragState]);
  const y = useMemo(() => dragState.point.y - dragState.start.y, [dragState]);
  const angle = useMemo(() => dragState.angle, [dragState]);

  return (
    <div {...(getRef && { ref: getRef.bind(null, index) })}
      onPointerEnter={(e)=>handlePointerEnter && handlePointerEnter(e)}
      onPointerLeave={(e)=>handlePointerLeave && handlePointerLeave(e)}
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
        transform:(dragState.stage !== DragStage.INACTIVE) ?
          `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          '',
        width:widthString,
        height:heightString,
        position: 'relative',
        zIndex: ((dragState.stage !== DragStage.INACTIVE)) ? 30 : 0,
        }}>
      <img src={imageSrc} draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        cursor:'pointer',
        marginTop:'auto',
        }}/>
    </div>);
};