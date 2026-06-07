'use client'

import { isCardDoublesided, MagicCard } from "./types/default";
import { FilterState, ImageMap } from "./CardDisplay";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { useCallback } from "react";

type Props = {
  loaded?:boolean,
  dragState:DragState,
  //cardDragMap:CardDragMap,
  filterState:FilterState,
  yCutoffHidden:number,
  numCardsRow:number,
  cards:MagicCard[],
  changeCard:(index:number, card:MagicCard)=>void,
  imageMap:ImageMap,
  handleCardPointerUp:(e:React.PointerEvent, index:number, x:number, y:number) => void,
}

const View:React.FC<Props> = ({
    loaded,
    dragState,
    filterState,
    yCutoffHidden,
    numCardsRow,
    cards,
    changeCard,
    imageMap,
    handleCardPointerUp,
  }:Props) => {

  const card = useCallback((name:string, index:number) => {
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
        widthString={`calc('100%/${numCardsRow}')`}
        heightString={'fit-content'}
        card={cards[index]}
        changeCard={(card:MagicCard) => changeCard(index, card)}
        imagePackets={imagePackets}
        handlePointerUp={(e:React.PointerEvent, x:number, y:number) => handleCardPointerUp(e, index, x, y)}
        />)}, [imageMap, cards, changeCard]);

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