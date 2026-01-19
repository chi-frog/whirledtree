'use client'

import { WPoint } from "@/helpers/wpoint";
import { MagicCard } from "./types/default";
import { ImagePacket } from "./SearchResults";
import { useMemo } from "react";

type Props = {
  x:number,
  y:number,
  widthString:string,
  heightString?:string,
  imageHeightString?:string,
  angle?:WPoint,
  card:MagicCard,
  imagePacket:ImagePacket|undefined,
  index:number,
  getRef?:(id:number, node:any) => () => void,
  dragging:boolean,
  isDragging:boolean,
  handlePointerEnter?:(e:React.PointerEvent) => void,
  handlePointerLeave?:(e:React.PointerEvent) => void,
  handlePointerDown?:(e:React.PointerEvent) => void,
  handlePointerUp?:(e:React.PointerEvent) => void,
};
export const Card:React.FC<Props> = ({
    x,
    y,
    widthString,
    heightString,
    imageHeightString,
    angle,
    card,
    imagePacket,
    index,
    getRef,
    dragging,
    isDragging,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
  }:Props) => {

  const imageSrc = useMemo(() => {
    if (!imagePacket) return undefined;

    if (imagePacket.largeBlob) return imagePacket.largeBlob;
    else return imagePacket.smallBlob;
  }, [imagePacket]);

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
        transform:(isDragging) ?
          `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          '',
        width:widthString,
        height:heightString,
        position: 'relative',
        zIndex: (isDragging) ? 30 : 0,
        }}>
      <img src={imageSrc} draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        cursor:(dragging) ? 'grabbing' : 'pointer',
        marginTop:'auto',
        }}/>
    </div>);
};