'use client'

import { WPoint } from "@/helpers/wpoint";
import { MagicCard } from "./types/default";
import { ImagePacket } from "./SearchResults";

type Props = {
  x:number,
  y:number,
  widthString:string,
  angle:WPoint|undefined,
  card:MagicCard,
  imagePacket:ImagePacket|undefined,
  index:number,
  getRef:(id:number, node:any) => () => void,
  dragging:boolean,
  isDragging:boolean,
  handlePointerEnter:(e:React.PointerEvent, index:number) => void,
  handlePointerLeave:(e:React.PointerEvent, index:number) => void,
  handlePointerDown:(e:React.PointerEvent, index:number) => void,
  handlePointerUp:(e:React.PointerEvent, index:number) => void,
};
export const Card:React.FC<Props> = ({
    x,
    y,
    widthString,
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


  return (
    <div ref={getRef.bind(null, index)}
      onPointerEnter={(e)=>handlePointerEnter(e, index)}
      onPointerLeave={(e)=>handlePointerLeave(e, index)}
      onPointerDown={(e) => handlePointerDown(e, index)}
      onPointerUp={(e) => handlePointerUp(e, index)} style={{
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
            height:'fit-content',
            position: 'relative',
            zIndex: (isDragging) ? 30 : 0,
            }}>
          <img src={imagePacket?.smallBlob} draggable="false" style={{
            maxWidth:'100%',
            cursor:(dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
           }}/>
        </div>
  );
};