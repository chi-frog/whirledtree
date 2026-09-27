'use client'

import { memo, PointerEventHandler, useRef, useState } from "react";
import { MagicCard, } from "../types/default";
import { _dragState, } from "../../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { SelectionUpdateFunction } from "@/hooks/magic/useSelection";
import { motion } from "framer-motion";
import { stopPropagationHandler } from "@/helpers/pointerEvent";
import ModalCardDisplay from "./ModalCardDisplay";
import CardTooltip from "@/components/magic/CardTooltip";
import CardInfoDisplay from "../card/CardInfoDisplay";
import { MagicSymbol } from "../types/magic";

type Props = {
  shown:boolean,
  close:()=>void,
  update:(card:MagicCard)=>void,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  updateCardPrintId:(card:MagicCard, id:string)=>void,
  updateSelected:SelectionUpdateFunction,
  card?:MagicCard,
}
const Modal:React.FC<Props> = ({
    shown,
    close,
    update,
    symbols,
    symbolImageMap,
    updateCardPrintId,
    updateSelected,
    card,
  }:Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

  const handlePointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();

    if ((e.target as HTMLElement).id === 'modal') {
      e.preventDefault();
      setExpanded(false);
      setTooltipVisible(false);
      close();
    }
  }

  return (
    <div id="modal" className="w-screen h-screen" ref={divRef}
      onPointerDown={handlePointerDown}
      onPointerUp={stopPropagationHandler}
      onPointerMove={(e)=>e.stopPropagation()}
      style={{
        background: (shown) ? 'rgba(120, 120, 120, 0.5)' : 'rgba(120, 120, 120, 0)',
        position:'fixed',
        top:'0px',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        whiteSpace:'nowrap',
        zIndex:50,
        visibility:(shown) ? 'visible' : 'hidden',
        pointerEvents:(shown) ? 'auto' : 'none',
        transition:'background 0.3s ease-in-out'
      }}>
      {card &&
      <motion.div id="inner"
        layoutId={`inner-${card.printId}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onLayoutAnimationComplete={() => {
          setTimeout(()=>{setExpanded(true);}, 100);
        }}
        style={{
          backgroundColor:'white',
          width:'fit-content',
          maxWidth:'80vw',
          height:'80vh',
          borderRadius:'20px',
          display:'flex',
          flexDirection:'row',
          color:'black',
          textAlign:'center',
          border: '2px solid rgba(146, 148, 248, 0.8)',
        }}>
        <ModalCardDisplay
          card={card}
          expanded={expanded}
          update={update}
          updateCardPrintId={updateCardPrintId}/>
        <CardInfoDisplay
          card={card}
          expanded={expanded}
          symbols={symbols}
          symbolImageMap={symbolImageMap}/>
      </motion.div>}
      <CardTooltip
        visible={tooltipVisible}
        setVisible={setTooltipVisible}
        divRef={divRef}
        updateSelected={updateSelected}
      />
    </div>
  )
};

export default memo(Modal);