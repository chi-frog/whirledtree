'use client'

import { MagicCard } from "./types/default";
import { CardDragMap, CardDragState, ImageMap } from "./SearchResults";
import { DragState, useDragContext } from "@/app/page";

type Props = {
  loaded:boolean,
  getRef:(id:number, node:any) => () => void,
  dragging:boolean,
  dragState:DragState,
  cardDragMap:CardDragMap,
  filterHidden:boolean,
  yCutoffHidden:number,
  numCardsRow:number,
  cards:MagicCard[],
  imageMap:ImageMap,
  handleCardPointerEnter:(e:React.PointerEvent, index:number) => void,
  handleCardPointerLeave:(e:React.PointerEvent, index:number) => void,
  handleCardPointerDown:(e:React.PointerEvent, index:number) => void,
  handleCardPointerUp:(e:React.PointerEvent, index:number) => void,
}

const View:React.FC<Props> = ({
    loaded,
    getRef,
    dragging,
    dragState,
    cardDragMap,
    filterHidden,
    yCutoffHidden,
    numCardsRow,
    cards,
    imageMap,
    handleCardPointerEnter,
    handleCardPointerLeave,
    handleCardPointerDown,
    handleCardPointerUp,
  }:Props) => {

  const {dragStartPointRef} = useDragContext();

  const card = (name:string, index:number) => {
    const cardDragState = cardDragMap.get(index);
    const isDragging = !!cardDragState;

    return (
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
            minWidth:'100px',
            transform:(isDragging) ?
              `translate3d(${dragState.point.x - dragStartPointRef.current.x}px, ${dragState.point.y - dragStartPointRef.current.y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${cardDragState.angle.x}deg) rotate3d(1, 0, 0, ${cardDragState.angle.y*-1}deg)` :
              '',
            height:'fit-content',
            position: 'relative',
            zIndex: (isDragging) ? 30 : 0,
            }}>
          <img src={imageMap.get(name)?.smallBlob} draggable="false" style={{
            maxWidth:'100%',
            cursor:(dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
           }}/>
        </div>)};

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
      {!loaded &&
      <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
        }}>Loading...</h4>}
      {loaded &&
      cards.map((_card, _index)=>
        card(_card.name, _index)
      )}
    </div>
  );
};

export default View;