'use client'

import { memo } from "react";
import CardPrintSelector from "../CardPrintSelector";
import { MagicCard } from "../types/default";
import { Card } from "../Card";
import { cardAspectRatio } from "@/hooks/magic/useMagicCards";

type Props = {
  prints:MagicCard[],
  index:number,
  changePrint:(amount: number) => void,
};
const ModalCardDisplay:React.FC<Props> = ({
  prints,
  index,
  changePrint
}) => {
  return (
  <div style={{
    position: 'relative',
    height: '100%',
    aspectRatio:cardAspectRatio,
    filter: 'drop-shadow(black 0px 10px 15px)'}}>
    <CardPrintSelector visible={prints.length > 1} location="right" func={changePrint}/>
    <CardPrintSelector visible={prints.length > 1} location="left" func={changePrint}/>
    {prints.map((_print, _index) => (
      <Card
        key={_index}
        visible={_index===index}
        location='modal'
        widthString={'fit-content'}
        heightString={'100%'}
        card={_print}/>))}
  </div>
  );
};

export default memo(ModalCardDisplay);