'use client'

import { DragStage, DragState } from "@/components/general/DragProvider";
import { memo } from "react";
import { MagicCard } from "../types/default";
import { Card } from "./Card";

type Props = {
  paddingTop:string,
  dragState:DragState,
  numCardsRow:number,
  updateCardReversed:(card:MagicCard, reversed:boolean)=>void
  cards:MagicCard[],
};
const CardView:React.FC<Props> = ({
    paddingTop,
    dragState,
    numCardsRow,
    updateCardReversed,
    cards,
  }:Props) => {

  return (
    <div className="hover:bg-blue" style={{
      paddingTop,
      overflow:'scroll',
      minWidth:'100vw',
      minHeight:'100vh',
      paddingLeft:'50px',
      paddingRight:'50px',
      paddingBottom:'10px',
      backgroundColor:'black',
      userSelect:(dragState.stage === DragStage.ACTIVE) ? 'none' : 'auto',
      transition:'padding 0.2s ease-in-out',
      color: 'black',
      display:'grid',
      gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {...cards.map((card, index)=>
        <Card
          key={card.name}
          location='view'
          heightString={'fit-content'}
          card={cards[index]}
          updateReversed={updateCardReversed.bind(null, card)}
          />
      )}
    </div>
  );
};

export default memo(CardView);