'use client'

import { MagicCard } from "./types/default";
import { CardDragMap, CardDragState, FilterState, ImageMap } from "./SearchResults";
import { DragState, useDragContext } from "@/app/page";
import { Card } from "./Card";

type Props = {
  loaded:boolean,
  getRef:(id:number, node:any) => () => void,
  dragging:boolean,
  dragState:DragState,
  cardDragMap:CardDragMap,
  filterState:FilterState,
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
    filterState,
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
      <Card
        key={name}
        x={dragState.point.x - dragStartPointRef.current.x}
        y={dragState.point.y - dragStartPointRef.current.y}
        widthString={`calc('100%/${numCardsRow}')`}
        angle={cardDragState?.angle}
        card={cards[index]}
        imagePacket={imageMap.get(name)}
        index={index}
        getRef={getRef}
        dragging={dragging}
        isDragging={isDragging}
        handlePointerEnter={(e:React.PointerEvent)=>handleCardPointerEnter(e, index)}
        handlePointerLeave={(e:React.PointerEvent)=>handleCardPointerLeave(e, index)}
        handlePointerDown={(e:React.PointerEvent) => handleCardPointerDown(e, index)}
        handlePointerUp={(e:React.PointerEvent) => handleCardPointerUp(e, index)}
        />)};

  return (
    <div className="hover:bg-blue" style={{
      paddingTop:(filterState === FilterState.REDUCED) ? '80px' : `${Math.min(yCutoffHidden, 80)}px`,
      overflow:'scroll',
      minWidth:'100vw',
      minHeight:'100vh',
      width:'fit-content',
      paddingLeft:'50px',
      paddingRight:'50px',
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