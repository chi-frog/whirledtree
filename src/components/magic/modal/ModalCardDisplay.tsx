'use client'

import { memo, useMemo, useState } from "react";
import CardPrintSelector from "../CardPrintSelector";
import { MagicCard } from "../types/default";
import { Card } from "../card/Card";
import { cardAspectRatio } from "@/hooks/magic/useMagicCards";

type Props = {
  card:MagicCard,
  update:(card:MagicCard)=>void,
  updateCardPrintId:(card:MagicCard, id:string)=>void,
};
const ModalCardDisplay:React.FC<Props> = ({
  card,
  update,
  updateCardPrintId,
}) => {
  const printIds = useMemo(() => Array.from(card.prints.entries()).map(([printId]) => printId), [card.prints]);
  const printIndex = printIds.findIndex((printId) => printId === card.printId);

  const reducePrintId = () => {
    const index = ((printIndex - 1) < 0) ? printIds.length - 1 : printIndex - 1;
    const printId = printIds[index];

    update({...card, printId});
    updateCardPrintId(card, printId);
  };
  const increasePrintId = () => {
    const index = ((printIndex + 1) >= printIds.length) ? 0 : printIndex + 1;
    const printId = printIds[index];

    update({...card, printId});
    updateCardPrintId(card, printId);
  };

  return (
  <div style={{
    position: 'relative',
    height: '100%',
    aspectRatio:cardAspectRatio,
    filter: 'drop-shadow(black 0px 10px 15px)'}}>
    <CardPrintSelector visible={printIds.length > 1} location="right" func={reducePrintId}/>
    <CardPrintSelector visible={printIds.length > 1} location="left" func={increasePrintId}/>
    <Card
      location='modal'
      widthString={'fit-content'}
      heightString={'100%'}
      card={card}/>))
  </div>
  );
};

export default memo(ModalCardDisplay);