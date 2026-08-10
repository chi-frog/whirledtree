'use client'

import { MagicCard } from "./types/default";
import { FilterState } from "./CardDisplay";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { useCallback } from "react";
import { ImageMap } from "@/hooks/magic/useMagicCards";

type Props = {
  dragState:DragState,
  filterState:FilterState,
  numCardsRow:number,
  hydrateImage:(card:MagicCard, size:'small'|'large')=>void,
  cards:MagicCard[],
  imageMap:ImageMap,
  handleCardPointerUp:(e:React.PointerEvent, card:MagicCard) => void,
};
const View:React.FC<Props> = ({
    dragState,
    filterState,
    numCardsRow,
    hydrateImage,
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
        heightString={'fit-content'}
        card={card}
        hydrateImage={hydrateImage}
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
      minHeight:'100vh',
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