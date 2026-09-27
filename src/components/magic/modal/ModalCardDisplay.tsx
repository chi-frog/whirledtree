'use client'

import { memo, useMemo, useState } from "react";
import CardPrintSelector from "../CardPrintSelector";
import { MagicCard } from "../types/default";
import { Card } from "../Card";
import { cardAspectRatio } from "@/hooks/magic/useMagicCards";

type Props = {
  card:MagicCard,
};
const ModalCardDisplay:React.FC<Props> = ({
  card,
}) => {
  const printIds = useMemo(() => Array.from(card.prints.entries()).map(([printId]) => printId), [card.prints]);
  const [displayedPrintIndex, setDisplayedPrintIndex] =
    useState<number>(
      printIds.findIndex((printId) =>
        (printId === card.printId)));

  const reducePrintId = () => setDisplayedPrintIndex((prev) => (prev-1 < 0 ? printIds.length - 1 : prev-1));
  const increasePrintId = () => setDisplayedPrintIndex((prev) => (prev+1 >= printIds.length ? 0 : prev+1));

  return (
  <div style={{
    position: 'relative',
    height: '100%',
    aspectRatio:cardAspectRatio,
    filter: 'drop-shadow(black 0px 10px 15px)'}}>
    <CardPrintSelector visible={printIds.length > 1} location="right" func={reducePrintId}/>
    <CardPrintSelector visible={printIds.length > 1} location="left" func={increasePrintId}/>
    {printIds.map((printId, index) => (
      <Card
        key={printId}
        visible={index === displayedPrintIndex}
        location='modal'
        widthString={'fit-content'}
        heightString={'100%'}
        card={{...card, printId}}/>))}
  </div>
  );
};

export default memo(ModalCardDisplay);