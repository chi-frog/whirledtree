'use client'

import { memo, PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, } from "../types/default";
import { _dragState, } from "../../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { SelectionUpdateFunction } from "@/hooks/magic/useSelection";
import OracleText from "../OracleText";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { motion } from "framer-motion";
import { transformMagicCard } from "@/hooks/magic/useMagicCards";
import { stopPropagationHandler } from "@/helpers/pointerEvent";
import useExternalData from "@/hooks/useExternalData";
import { useCardRepositoryContext } from "../../general/CardRepoProvider";
import ModalCardDisplay from "./ModalCardDisplay";
import CardTooltip, { searchFields } from "@/components/magic/CardTooltip";

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
  const [printsError, printsLoaded, rawPrints] =
    useExternalData<MagicCard>((card) ? card.printsUri : '', transformMagicCard, {
      onTransform:(card:MagicCard) => addCard(card),
    });
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

  const nameFontSize = useMemo(() => {
    return 30;
  }, [card?.name, card?.reversed]);

  const oracleText:[string, string] = useMemo(() =>
    (!card)      ? ["", ""] :
    (!card.back) ? [card.oracleText, ""] :
                   [card.oracleText, card.back.oracleText]
  , [card?.oracleText]);

  const manaCostImages = useMemo(() => {
    if (!card) return [];

    let face = (card.reversed) ? card.back : card;
    if ((!face) ||
        !(face.manaCost)) return [];

    const manaCost = face.manaCost;
    const manaSymbols = symbols.filter((symbol) => card.manaCost.includes(symbol.symbol));
    const indices = manaSymbols.reduce<{manaCostIndex:number, symbol:MagicSymbol}[]>((indices, symbol) => {
      let newIndices = [...indices];
      let index = -1;
      while ((index = manaCost.indexOf(symbol.symbol, index + 1)) >= 0)
        newIndices.push({manaCostIndex:index, symbol});

      return newIndices;
    }, []);

    const orderedIndices = indices.toSorted((a, b) => a.manaCostIndex - b.manaCostIndex);
    const orderedSymbols = orderedIndices.map((index) => index.symbol);
    return orderedSymbols;

  }, [symbols, card?.manaCost, card?.reversed, symbolImageMap]);

  const types = useMemo(() => {
    const typeLine = (!card?.reversed) ? card?.typeLine :
                                         card?.back?.typeLine;
    return (typeLine) ? typeLine?.split(' ') : [""];
  }, [card?.reversed]);

  const power = useMemo(() =>
    (card?.reversed) ?
      (!card?.back) ? null :
                     card.back.power :
      card?.power, [card?.power, card?.reversed])

  const toughness = useMemo(() => {
    if (card?.reversed) {
      if (!card.back) return null;
      else return card.back.toughness;
    } else
      return card?.toughness;
  }, [card?.toughness, card?.reversed]);

  const prints = useMemo(() =>
    (!card) ?
      [] :
    ((rawPrints.length === 0) ||
     (rawPrints[0].oracleId !== card.oracleId)) ?
      [card] :
      rawPrints
  , [card, rawPrints]);

  useEffect(() => {
    if (!card) return;

    const index = prints.findIndex((_print) =>
      (_print.id === card.id));

    console.log('index:' + index);

    setPrintIndex(index);
  }, [prints]);

  const changePrint = useCallback((amount:number) => {
    if (!card || prints.length <= 1) return;
    
    setPrintIndex((prev) => {
      let i = prev + amount;

      if (i < 0) i = prints.length - 1;
      else if (i >= prints.length) i = 0;

      return i;
    });
  }, [card?.oracleId, prints, card]);

  console.log('RENDER MODAL', card);
  console.log('RENDER MODAL', prints);

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
      {card && <motion.div id="inner"
        layoutId={`inner-${card.id}`}
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
          prints={prints}
          changePrint={changePrint}/>
        <div id="cardInformation"
          style={{
          flexGrow:1,
          flexDirection:'column',
          overflowX:'hidden',
          overflowY:'scroll',
          textWrap:'wrap',
          width:(expanded) ? 'auto' : '0px',
        }}>
          <div className="nameDiv" ref={nameRef} style={{
            display:"flex",
            flexDirection:'row',
            marginTop:28,
            justifyContent:'center',
            alignItems:'center',
          }}>
            <h3 className="selectable name" title="Search By Name"
              data-field={searchFields.name}
              style={{
                fontSize:nameFontSize,
                fontWeight:'bold',
                paddingRight:'10px',
              }}>
              {(!card?.reversed) ? card?.name :
                                   card?.back?.name}
            </h3>
            <div className="selectable mana" title="Search By Mana Cost"
              data-field={searchFields.manaValue} style={{
                display:'flex',
              }}>
              {...manaCostImages?.map((symbol, index) => (
                <img key={index} draggable="false" src={symbol.imageUri} alt={symbol.symbol}
                  className="icon"
                  style={{
                    width:'24px',
                    height:'24px',
                    borderRadius:'50%',
                    boxShadow:'-0.8px 1.5px black',
                    margin:'1px',
                  }}/>
              ))}
            </div>
          </div>
          <div className="selectable type" title="Search By Type">
            <h3 className="selectable type" title="Search By Type"
              data-field={searchFields.type}
              style={{
                fontSize:'20px',
                fontWeight:'bold',
              }}>
              {...types.reduce((_result, _type, _index) => {
                let jsx;

                if (_type === "—") jsx = (
                  <span key="-" style={{
                    userSelect:'none',
                    marginRight:'5px',
                  }}>-</span>
                );
                else jsx = (
                  <span key={_type} className="selectableBit" style={{
                    userSelect:'all',
                    marginRight:(_index !== types.length - 1) ? '5px' : '0px',
                  }}>
                    {_type}
                  </span>
                );

                return _result.concat(jsx);
              }, [] as React.JSX.Element[])}
            </h3>
          </div>
          {(oracleText) &&
            <div className="selectable oracle" title="Search By Oracle Text"
              data-field={searchFields.oracleText}>
              <OracleText
                oracleText={(card?.reversed) ? oracleText[1] : oracleText[0]}
                symbols={symbols}/>
            </div>}
          {power && toughness &&
          <div title="Search By Power/Toughness" style={{
              display:'flex',
              justifyContent:'center',
            }}>
            <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
              data-field={searchFields.power}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              {power}
            </h3>
            <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
              data-field={searchFields.power}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              /
            </h3>
            <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
              data-field={searchFields.toughness}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              {toughness}
            </h3>
          </div>
          }
        </div>
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