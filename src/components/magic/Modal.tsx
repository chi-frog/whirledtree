'use client'

import { memo, PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, } from "./types/default";
import { Card } from "./Card";
import { SelectionChangeFunc, useSelectionContext } from "../general/SelectionProvider";
import { _dragState, } from "../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { FilterUpdateFunction, SKey } from "@/hooks/magic/useFilters";
import OracleText from "./OracleText";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { LayoutGroup, motion } from "framer-motion";
import { ImagePacket } from "@/hooks/magic/useMagicCards";
import CardPrintSelector from "./CardPrintSelector";
import Tooltip, { tooltipMargin, TooltipState } from "./Tooltip";
import { renderToStaticMarkup } from "react-dom/server";
import { stopPropagationHandler } from "@/helpers/pointerEvent";

export const searchFields = {
  game: "game",
  name: "name",
  format: "format",
  set: "set",
  type: "type",
  power: "power",
  toughness: "toughness",
  oracleText: "oracleText",
  manaValue: "manaValue",
} as const satisfies Record<SKey, SKey>;

const tooltipText = (selectionField:string, selection:string) => {
  const span = (<span style={{fontWeight:'bold', color:'rgba(146, 148, 248, 1)'}}>{selection}</span>);
  const text =
    (selectionField === searchFields.oracleText) ?
      (<h1>Search for cards with {span} in their oracle text.</h1>) :
      (<h1>Search for cards with {span} in their {selectionField}</h1>);

  return text;
};

type SearchTooltipProps = {
  selection:string,
  selectionPoint:{x:number, y:number},
  selectionField:string,
  tooltipMargin:number,
}
function createSearchTooltip({
  selection,
  selectionPoint,
  selectionField,
  tooltipMargin,
}:SearchTooltipProps) {
  // Root
  const div = document.createElement("div");
  div.id = "searchTooltip";

  Object.assign(div.style, {
    position: "absolute",
    userSelect: "none",
    top: `${selectionPoint.y - 35 - tooltipMargin}px`,
    left: `${selectionPoint.x}px`,
    width: "fit-content",
    display: "flex",
    flexDirection: "column",
    borderRadius: "5px",
    justifyContent: "center",
    border: "2px solid rgba(146, 148, 248, 0.8)",
    padding: "2px 5px 2px 5px",
    visibility: "hidden",
    zIndex:500,
  });

  div.innerHTML = renderToStaticMarkup(tooltipText(selectionField, selection));

  return div;
}

function getField(node:Node|null):Element|null {
  if (!node) return null;

  // Text nodes and img elements don't have .closest — use parentElement
  const el = (node instanceof Element) ? node : node.parentElement;
  return el?.closest('[data-field]') ?? null;
}

export function findNearestField(node:Node|null) {
  if (!node) return null;

  let currentNode:HTMLElement|null = (node as HTMLElement);
  let property = currentNode?.dataset?.field;

  while ((currentNode) && !(property)) {
    currentNode = currentNode.parentElement;
    property = currentNode?.dataset?.field;
  }

  return property;
}

type Props = {
  shown:boolean,
  close:()=>void,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  updateSelected:FilterUpdateFunction,
  card?:MagicCard,
  cardBackImagePacket?:ImagePacket,
}
const Modal:React.FC<Props> = ({
    shown,
    close,
    symbols,
    symbolImageMap,
    updateSelected,
    card,
    cardBackImagePacket,
  }:Props) => {
  const [selection, setSelection] = useState<string>("");
  const [selectionField, setSelectionField] = useState<string>("");
  const [selectionPoint, setSelectionPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [tooltipState, setTooltipState] = useState<TooltipState>(TooltipState.HIDDEN);
  const [tooltipOverhang, setTooltipOverhang] = useState<number>(0);
  const {subSelection} = useSelectionContext();
  const divRef = useRef(null);
  const nameRef = useRef(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  const onSelectionChange:SelectionChangeFunc = (e) => {
    const newSelection = e.toString();

    if ((newSelection === '') ||
        (!divRef.current) ||
        (e.rangeCount === 0)) {

      setSelection(newSelection);
      setTooltipState(TooltipState.HIDDEN);
      setSelectionField("");
      return;

    } else if ((newSelection === selection))
      return;

    const range = e.getRangeAt(0);
    const selectionBox = range?.getBoundingClientRect();

    const startField = getField(range.startContainer);
    const endField = getField(range.endContainer);

    // No zone found, or selection spans two different zones -> reject it
    if (!startField || !endField || startField !== endField) {
      e.removeAllRanges();
      return;
    }

    if (selectionBox) {
      let x = selectionBox.x;
      const y = selectionBox.y;
      const windowWidth = window.innerWidth;

      let property = findNearestField(e.anchorNode);
      if (!property) {
        console.warn('No Property Found');
        return;
      }

      setSelectionField(property);

      const testTooltip = createSearchTooltip({
        selection: newSelection,
        selectionPoint: {x, y},
        selectionField: property,
        tooltipMargin,
      });

      (divRef.current as HTMLElement).appendChild(testTooltip);

      const tooltipWidth = testTooltip.offsetWidth;
      const overhang = (windowWidth - (x + tooltipWidth + 2));

      testTooltip.remove();

      setSelectionPoint({x:x, y:y});
      setTooltipOverhang(overhang < 0 ? overhang : 0);
    }

    setSelection(newSelection);
    setTooltipState(TooltipState.SHOWN);
  };

  useEffect(() => {
    return subSelection({tag:'modal', onSelectionChange});
  }, []);

  const handlePointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();

    if ((e.target as HTMLElement).id === 'modal')
      close();
  }

  const nameFontSize = useMemo(() => {
    return 30;
  }, [card?.name, card?.reversed]);

  const oracleText = useMemo(() =>
    (!card) ? "" :
    (!card.reversed) ? card.oracleText :
    (card.back)      ? card.back?.oracleText :
                        ""
  , [card?.reversed, card?.oracleText, card?.back]);

  const manaCostImages = useMemo(() => {
    if (!card) return [];

    let face = (card.reversed) ? card.back : card;

    const manaCost = (face) ? face.manaCost : "";
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

  if (card) console.log('CARD IN MODAL');

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
        layoutId={`inner-${card?.name}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
        backgroundColor:'white',
        width:'fit-content',
        height:'fit-content',
        borderRadius:'20px',
        display:'flex',
        flexDirection:'row',
        color:'black',
        textAlign:'center',
        border: '2px solid rgba(146, 148, 248, 0.8)',
      }}>
        <div style={{ position: 'relative', width: 'fit-content', height: '100%' }}>
          <CardPrintSelector location="right"/>
          <CardPrintSelector location="left"/>
          <Card
            location='modal'
            widthString={'fit-content'}
            heightString={'80vh'}
            imageHeightString={'100%'}
            card={card}
            cardBackImagePacket={cardBackImagePacket}
          />
        </div>
        <div id="cardInformation"
          style={{
          flexGrow:1,
          display:'none',
          flexDirection:'column',
          overflow:'hidden',
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
          <div className="selectable oracle" title="Search By Oracle Text"
            data-field={searchFields.oracleText}>
            <OracleText
              oracleText={oracleText}
              symbols={symbols}/>
          </div>
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
      <Tooltip 
        updateSelected={updateSelected}
        selection={selection}
        selectionPoint={selectionPoint}
        selectionField={selectionField}
        overhang={tooltipOverhang}
        state={tooltipState}
        />
    </div>
  )
};

export default memo(Modal);