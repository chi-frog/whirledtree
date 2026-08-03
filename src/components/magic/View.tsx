'use client'

import { isCardDoublesided, MagicCard } from "./types/default";
import { FilterState } from "./CardDisplay";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { useCallback } from "react";
import { ImageMap } from "@/hooks/magic/useMagicCards";

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
    const card = cards[index];
    const cardBackImagePacket = imageMap.get("")?.get("");
    const imagePacket = imageMap.get(card.oracleId)?.get(card.id);

    return (
      <Card
        key={name}
        location='view'
        index={index}
        heightString={'fit-content'}
        card={cards[index]}
        imagePacket={imagePacket}
        cardBackImagePacket={cardBackImagePacket}
        handlePointerUp={handleCardPointerUp}
        />)},
    [imageMap, cards, numCardsRow]);

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