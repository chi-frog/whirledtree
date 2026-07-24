'use client'

import { isCardDoublesided, MagicCard } from "./types/default";
import { FilterState, ImageMap } from "./CardDisplay";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { useCallback } from "react";

type Props = {
  dragState:DragState,
  filterState:FilterState,
  numCardsRow:number,
  cards:MagicCard[],
  imageMap:ImageMap,
  handleCardPointerUp:(e:React.PointerEvent, index:number, x:number, y:number) => void,
}

const View:React.FC<Props> = ({
    dragState,
    filterState,
    numCardsRow,
    cards,
    imageMap,
    handleCardPointerUp,
  }:Props) => {

  const card = useCallback((name:string, index:number) => {
    const frontImagePacket = imageMap.get(name);
    const card = cards[index];
    const cardBackImagePacket = imageMap.get("");
    const backImagePacket = ((card.back) && isCardDoublesided(card)) ?
      imageMap.get(card.back.name) :
      cardBackImagePacket;

    return (
      <Card
        key={name}
        location='view'
        index={index}
        widthString={`calc('100% / ${numCardsRow}')`}
        heightString={'fit-content'}
        card={cards[index]}
        frontImagePacket={frontImagePacket}
        backImagePacket={backImagePacket}
        cardBackImagePacket={cardBackImagePacket}
        handlePointerUp={handleCardPointerUp}
        />)},
    [imageMap, cards]);

  return (
    <div className="hover:bg-blue" style={{
      paddingTop:(filterState === FilterState.REDUCED) ? '80px' : '10px',
      overflow:'scroll',
      minWidth:'100vw',
      paddingLeft:'50px',
      paddingRight:'50px',
      backgroundColor:'black',
      userSelect:(dragState.stage === DragStage.ACTIVE) ? 'none' : 'auto',
      transition:'padding 0.2s ease-in-out',
      color: 'black',
      display:'grid',
      gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {...cards.map((_card, _index)=>
        card(_card.name, _index)
      )}
    </div>
  );
};

export default View;