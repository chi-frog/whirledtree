'use client'

import { MagicCard } from "./types/default";
import { Card } from "./Card";
import { _dragState, DragStage, DragState } from "../general/DragProvider";
import { memo } from "react";

type Props = {
  paddingTop:string,
  dragState:DragState,
  numCardsRow:number,
  cards:MagicCard[],
};
const View:React.FC<Props> = ({
    paddingTop,
    dragState,
    numCardsRow,
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
      {...cards.map((_card, _index)=>
        <Card
          key={cards[_index].name}
          location='view'
          heightString={'fit-content'}
          card={cards[_index]}
          />
      )}
    </div>
  );
};

export default memo(View);