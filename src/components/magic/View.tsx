'use client'

import { MagicCard } from "./types/default";
import { ImageMap } from "./SearchResults";
import { DragState } from "@/app/page";

type Props = {
  loading:boolean,
  getRef:(id:number, node:any) => () => void,
  dragging:boolean,
  dragState:DragState,
  filterHidden:boolean,
  yCutoffHidden:number,
  numCardsRow:number,
  cards:MagicCard[],
  draggingCardIndex:number,
  imageMap:ImageMap,
  handleCardPointerEnter:(e:React.PointerEvent, index:number) => void,
  handleCardPointerLeave:(e:React.PointerEvent, index:number) => void,
  handleCardPointerDown:(e:React.PointerEvent, index:number) => void,
  handleCardPointerUp:(e:React.PointerEvent, index:number) => void,
}

const View:React.FC<Props> = ({
    loading,
    getRef,
    dragging,
    dragState,
    filterHidden,
    yCutoffHidden,
    numCardsRow,
    cards,
    draggingCardIndex,
    imageMap,
    handleCardPointerEnter,
    handleCardPointerLeave,
    handleCardPointerDown,
    handleCardPointerUp,
  }:Props) => {

  const card = (name:string, index:number) => (
    <div key={name} ref={getRef.bind(null, index)}
          onPointerEnter={(e)=>handleCardPointerEnter(e, index)}
          onPointerLeave={(e)=>handleCardPointerLeave(e, index)}
          onPointerDown={(e) => handleCardPointerDown(e, index)}
          onPointerUp={(e) => handleCardPointerUp(e, index)} style={{
            display:'flex',
            cursor:'hand',
            flexDirection:'column',
            margin:'5px',
            overflow:'hidden',
            borderRadius:'12px',
            border:'1px solid rgba(255, 255, 255, 0.7)',
            transition:(draggingCardIndex === index) ?
              '' : 'top 0.3s ease-in-out left 0.3s ease-in-out',
            minWidth:'100px',
            transform:(draggingCardIndex === index) ?
              `rotate3d(${dragState.velocity.x}, ${dragState.velocity.y}, 0, 60deg)` : '',
            height:'fit-content',
            position: 'relative',
            zIndex: (draggingCardIndex === index) ? 30 : 0,
            left: (draggingCardIndex === index) ? `${dragState.point.x}px` : '0px',
            top: (draggingCardIndex === index) ? `${dragState.point.y}px` : '0px',
            }}>
          <img src={imageMap.get(name)?.smallBlob} draggable="false" style={{
            maxWidth:'100%',
            cursor:(dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
           }}/>
        </div>
  );

  return (
    <div className="hover:bg-blue" style={{
      paddingTop:`${(filterHidden) ? Math.min(yCutoffHidden, 80) : 80}px`,
      overflow:'scroll',
      minWidth:'100vw',
      minHeight:'100vh',
      width:'fit-content',
      paddingLeft:'15px',
      paddingRight:'15px',
      backgroundColor:'black',
      userSelect:(dragging) ? 'none' : 'auto',
      transition:'padding 0.1s ease-in-out',
      color: 'black',
      display:'grid',
      gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {loading &&
      <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
        }}>Loading...</h4>}
      {!loading &&
      cards.map((_card, _index)=>
        card(_card.name, _index)
      )}
    </div>
  );
};

export default View;