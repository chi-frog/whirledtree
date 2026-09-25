'use client'

import { memo, PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, } from "../types/default";
import { _dragState, } from "../../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { SelectionUpdateFunction } from "@/hooks/magic/useSelection";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { motion } from "framer-motion";
import { transformMagicCard } from "@/hooks/magic/useMagicCards";
import { stopPropagationHandler } from "@/helpers/pointerEvent";
import useExternalData from "@/hooks/useExternalData";
import { useCardRepositoryContext } from "../../general/CardRepoProvider";
import ModalCardDisplay from "./ModalCardDisplay";
import CardTooltip from "@/components/magic/CardTooltip";
import CardInfoDisplay from "../card/CardInfoDisplay";

type Props = {
  shown:boolean,
  close:()=>void,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  updateSelected:SelectionUpdateFunction,
  card?:MagicCard,
}
const Modal:React.FC<Props> = ({
    shown,
    close,
    symbols,
    symbolImageMap,
    updateSelected,
    card,
  }:Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const {addCard, getCardPrints} = useCardRepositoryContext();
  const [printIndex, setPrintIndex] = useState<number>(0);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

  const handlePointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();

    if ((e.target as HTMLElement).id === 'modal') {
      e.preventDefault();
      setExpanded(false);
      setPrintIndex(0);
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
        layoutId={`inner-${card.oracleId}`}
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
          index={printIndex}
          prints={[]}
          changePrint={()=>{}}/>
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