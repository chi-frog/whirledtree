'use client'

import { isCardDoublesided, MagicCard } from "./types/default";
import { FilterState, ImageMap } from "./CardDisplay";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { CardDragMap } from "@/hooks/useCardDrag";

type Props = {
  loaded?:boolean,
  getRef:(id:number, node:any) => () => void,
  dragState:DragState,
  cardDragMap:CardDragMap,
  filterState:FilterState,
  yCutoffHidden:number,
  numCardsRow:number,
  cards:MagicCard[],
  changeCard:(index:number, card:MagicCard)=>void,
  imageMap:ImageMap,
  handleCardPointerDown:(e:React.PointerEvent, index:number) => void,
  handleCardPointerUp:(e:React.PointerEvent, index:number) => void,
}

const View:React.FC<Props> = ({
    loaded,
    getRef,
    dragState,
    cardDragMap,
    filterState,
    yCutoffHidden,
    numCardsRow,
    cards,
    changeCard,
    imageMap,
    handleCardPointerDown,
    handleCardPointerUp,
  }:Props) => {

  const card = (name:string, index:number) => {
    const cardDragState = cardDragMap.get(index);
    const frontImagePacket = imageMap.get(name);
    const imagePackets = (frontImagePacket) ? [frontImagePacket] : [];
    const card = cards[index];

    if (card.back && isCardDoublesided(card)) {
      const backImagePacket = imageMap.get(card.back.name);
      if (backImagePacket) imagePackets.push(backImagePacket);
    }

    return (
      <Card
        key={name}
        location='view'
        dragState={cardDragState}
        widthString={`calc('100%/${numCardsRow}')`}
        heightString={'fit-content'}
        card={cards[index]}
        changeCard={changeCard.bind(null, index)}
        imagePackets={imagePackets}
        handlePointerDown={(e:React.PointerEvent) => handleCardPointerDown(e, index)}
        handlePointerUp={(e:React.PointerEvent) => handleCardPointerUp(e, index)}
        />)};

  return (
    <div className="hover:bg-blue" style={{
      paddingTop:(filterState === FilterState.REDUCED) ? '80px' : `${Math.min(yCutoffHidden, 80)}px`,
      overflow:'scroll',
      minWidth:'100vw',
      width:'fit-content',
      paddingLeft:'50px',
      paddingRight:'50px',
      backgroundColor:'black',
      userSelect:(dragState.stage === DragStage.ACTIVE) ? 'none' : 'auto',
      transition:'padding 0.2s ease-in-out',
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