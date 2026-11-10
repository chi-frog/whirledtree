'use client'

import { memo, useMemo } from "react";
import CardPrintSelector from "../card/CardPrintSelector";
import { MagicCard } from "../types/default";
import { Card } from "../card/Card";
import { cardAspectRatio } from "@/hooks/magic/useMagicCards";

type Props = {
  card:MagicCard,
  expanded:boolean,
  update:(card:MagicCard)=>void,
  updateCardPrintId:(card:MagicCard, id:string)=>void,
  updateCardReversed:(card:MagicCard, reversed:boolean)=>void,
};
const ModalCardDisplay:React.FC<Props> = ({
  card,
  expanded,
  update,
  updateCardPrintId,
  updateCardReversed,
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

  const reverse = (reversed:boolean) => {
    update({...card, reversed})
    updateCardReversed(card, reversed)
  }

  const printSelectorsVisible = useMemo(() =>
    (printIds.length>1) && (expanded), [printIds, expanded])

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      zIndex:5,
      aspectRatio:cardAspectRatio,
      filter: 'drop-shadow(black 0px 10px 15px)'}}>
      <CardPrintSelector visible={printSelectorsVisible} location="right" func={reducePrintId}/>
      <CardPrintSelector visible={printSelectorsVisible} location="left" func={increasePrintId}/>
      <Card
        location='modal'
        widthString={'fit-content'}
        heightString={'100%'}
        card={card}
        updateReversed={reverse}
        dontAnimate={expanded}/>))
    </div>
  );
};

export default memo(ModalCardDisplay);