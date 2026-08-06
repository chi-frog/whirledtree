'use client'

import { memo, PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, } from "./types/default";
import { Card } from "./Card";
import { SelectionChangeFunc, useSelectionContext } from "../general/SelectionProvider";
import { _dragState, } from "../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import OracleText from "./OracleText";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { motion } from "framer-motion";
import { ImagePacket } from "@/hooks/magic/useMagicCards";
import CardPrintSelector from "./CardPrintSelector";

enum TooltipState {
  HIDDEN='hidden',
  PENDING='pending',
  SHOWN='shown',
}


 export const enum searchField {
  NAME='name',
  TYPE='type',
  MANA='mana cost',
  POWER='power',
  TOUGHNESS='toughness',
  ORACLE='oracle text'
}

type SearchTooltipProps = {
  selection:string,
  selectionPoint:{x:number, y:number},
  tooltipMargin:number,
  property:string,
}
function createSearchTooltip({
  selection,
  selectionPoint,
  tooltipMargin,
  property,
}:SearchTooltipProps) {
  // Root
  const div = document.createElement("div");
  div.id = "searchTooltip";

  Object.assign(div.style, {
    position: "absolute",
    background: "white",
    userSelect: "none",
    top: `${selectionPoint.y - 35 - tooltipMargin}px`,
    left: `${selectionPoint.x}px`,
    width: "fit-content",
    color: "black",
    display: "flex",
    flexDirection: "column",
    borderRadius: "5px",
    justifyContent: "center",
    border: "2px solid rgba(146, 148, 248, 0.8)",
    padding: "2px 5px 2px 5px",
    visibility: "hidden"
  });

  // Content
  const h1 = document.createElement("h1");
  h1.append("Search for cards with ");

  const span = document.createElement("span");
  span.style.fontWeight = "bold";
  span.style.color = "rgba(146, 148, 248, 1)";
  span.textContent = selection;
  h1.append(span, " in their ", property);
  div.appendChild(h1);

  return div;
}

type Props = {
  close:()=>void,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  updateSelected:FilterUpdateFunction,
  card:MagicCard,
  imagePacket?:ImagePacket,
  cardBackImagePacket?:ImagePacket,
}

const tooltipMargin = 5;

const Modal:React.FC<Props> = ({
    close,
    symbols,
    symbolImageMap,
    updateSelected,
    card,
    imagePacket,
    cardBackImagePacket,
  }:Props) => {
  const [selection, setSelection] = useState<string>("");
  const [selectionField, setSelectionField] = useState<string>("");
  const [selectionPoint, setSelectionPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [tooltipState, setTooltipState] = useState<TooltipState>(TooltipState.HIDDEN);
  const [tooltipOverhang, setTooltipOverhang] = useState<number>(0);
  const [tooltipHovered, setTooltipHovered] = useState<boolean>(false);
  const {subSelection} = useSelectionContext();
  const ref = useRef(null);
  const divRef = useRef(null);
  const nameRef = useRef(null);

  function getField(node:Node|null):Element|null {
    if (!node) return null;

    // Text nodes and img elements don't have .closest — use parentElement
    const el = (node instanceof Element) ? node : node.parentElement;
    return el?.closest('[data-field]') ?? null;
  }

  const onSelectionChange:SelectionChangeFunc = (e) => {
    const newSelection = e.toString();

    if (newSelection === '') {
      setSelection(newSelection);
      setTooltipState(TooltipState.HIDDEN);
      setSelectionField("");
      return;
    }
    if ((newSelection === selection) ||
        (!ref.current) ||
        (!divRef.current) ||
        (e.rangeCount === 0)) {
      setSelection("");
      setTooltipState(TooltipState.HIDDEN);
      setSelectionField("");
      return;
    }

    const range = e.getRangeAt(0);
    const selectionBox = range?.getBoundingClientRect();

    const startField = getField(range.startContainer);
    const endField = getField(range.endContainer);

    // No zone found, or selection spans two different zones -> reject it
    if (!startField || !endField || startField !== endField) {
      e.removeAllRanges();
      console.log('removed all');
      console.log('start', startField);
      console.log('end', endField);
      return;
    }

    if (selectionBox) {
      let x = selectionBox.x;
      const y = selectionBox.y;
      const windowWidth = window.innerWidth;
      console.log('e', e);

      function findNearestField(node:Node|null) {
        if (!node) return null;

        let currentNode:HTMLElement|null = (node as HTMLElement);
        let property = currentNode?.dataset?.field;

        while ((currentNode) && !(property)) {
          currentNode = currentNode.parentElement;
          property = currentNode?.dataset?.field;
        }

        return property;
      }

      let property = findNearestField(e.anchorNode);
      if (!property) {
        console.log('No Property Found');
        return;
      }

      setSelectionField(property);
      const testTooltip = createSearchTooltip({
        selection: newSelection,
        selectionPoint,
        tooltipMargin,
        property,
      });

      const div = (divRef.current as HTMLElement);

      div.appendChild(testTooltip);
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
    subSelection({tag:'modal', onSelectionChange});
  }, [ref.current]);

  const handleTooltipPointerDown:PointerEventHandler = (e) => {
    const docSelection = document.getSelection();
    if (!docSelection) return;
    console.log('e', e);
    console.log("Our Selection:" + selection);
    console.log('selection', docSelection);
    console.log(docSelection.anchorNode?.parentElement);
    const property = docSelection.anchorNode?.parentElement?.dataset.field;
    if (!property) {
      console.error("Invalid Property:", property);
      return;
    }
    updateSelected({property:property as keyof Selected, value:selection});
    document.getSelection()?.empty();
  };

  const handleTooltipPointerEnter:PointerEventHandler = (e) => {
    setTooltipHovered(true);
  };

  const handleTooltipPointerLeave:PointerEventHandler = (e) => {
    setTooltipHovered(false);
  };

  const handlePointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();

    if ((e.target as HTMLElement).id === 'modal')
      close();
  }

  const handlePointerUp:PointerEventHandler = (e) => {
    e.stopPropagation();

  }

  const handleCardPointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const handleCardPointerUp:PointerEventHandler = (e) => {
    e.stopPropagation();
  }

  const nameFontSize = useMemo(() => {
    console.log('Changing Name Font Size');
    console.log('Name Ref:', nameRef.current);
    console.log('Div Ref', divRef.current);
    return 30;
  }, [card.name, card.reversed]);

  const oracleText = useMemo(() =>
    (!card?.reversed) ? card?.oracleText :
    (card?.back)      ? card?.back?.oracleText :
                        ""
  , [card.reversed, card.oracleText, card.back]);

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

  }, [symbols, card.manaCost, card.reversed, symbolImageMap]);

  const types = useMemo(() => {
    const typeLine = (!card?.reversed) ? card?.typeLine :
                                         card?.back?.typeLine;
    return (typeLine) ? typeLine?.split(' ') : [""];
  }, [card.reversed]);

  const power = useMemo(() =>
    (card.reversed) ?
      (!card.back) ? null :
                     card.back.power :
      card.power, [card.power, card.reversed])

  const toughness = useMemo(() => {
    if (card.reversed) {
      if (!card.back) return null;
      else return card.back.toughness;
    } else
      return card.toughness;
  }, [card.toughness, card.reversed]);

  return (
    <div id="modal" className="w-screen h-screen" ref={divRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={(e)=>e.stopPropagation()}
      style={{
        background: 'rgba(120, 120, 120, 0.5)',
        position:'fixed',
        top:'0px',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        whiteSpace:'nowrap',
        zIndex:50,
      }}>
      <motion.div id="inner" 
        initial={{opacity:0, width:'0', height:'0'}}
        animate={{opacity:1, width:'80vw', height:'80vh'}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
        backgroundColor:'white',
        height: '80vh',
        width: '80vw',
        borderRadius:'20px',
        display:'flex',
        flexDirection:'row',
        color:'black',
        textAlign:'center',
        border: '2px solid rgba(146, 148, 248, 0.8)',
      }}>
        {card && <div style={{ position:'relative', width:'fit-content', height:'100%' }}>
          <CardPrintSelector location="right"/>
          <CardPrintSelector location="left"/>
          <Card
            location='modal'
            widthString={'fit-content'}
            heightString={'100%'}
            imageHeightString={'100%'}
            card={card}
            imagePacket={imagePacket}
            cardBackImagePacket={cardBackImagePacket}
            handlePointerUp={handleCardPointerUp}
          />
        </div>}
        <div id="text" style={{
          flexGrow:1,
          display:'flex',
          flexDirection:'column',
          textWrap:'wrap',
        }}>
          <div className="nameDiv" ref={nameRef} style={{
            display:"flex",
            flexDirection:'row',
            marginTop:28,
            justifyContent:'center',
            alignItems:'center',
          }}>
            <h3 className="selectable name" title="Search By Name"
              data-field={searchField.NAME}
              style={{
                fontSize:nameFontSize,
                fontWeight:'bold',
                paddingRight:'10px',
              }}>
              {(!card?.reversed) ? card?.name :
                                   card?.back?.name}
            </h3>
            <div className="selectable mana" title="Search By Mana Cost"
              data-field={searchField.MANA} style={{
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
              data-field={searchField.TYPE}
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
            data-field={searchField.ORACLE}>
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
              data-field={searchField.POWER}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              {power}
            </h3>
            <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
              data-field={searchField.POWER}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              /
            </h3>
            <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
              data-field={searchField.TOUGHNESS}
              style={{
                fontSize:'30px',
                fontWeight:'bold',
              }}>
              {toughness}
            </h3>
          </div>
          }
        </div>
      </motion.div>
      <div id="searchTooltip" ref={ref}
        className="hover:bg-sky-200"
        onPointerDown={handleTooltipPointerDown}
        onPointerEnter={handleTooltipPointerEnter}
        onPointerLeave={handleTooltipPointerLeave}
        style={{
        cursor:'pointer',
        position:'absolute',
        background:(!tooltipHovered) ? 'white' : 'oklch(90.1% .058 230.902)',
        transition:'background 0.1s ease-in-out, left 0.1s ease-in-out',
        userSelect:'none',
        top:(selectionPoint.y - 35 - tooltipMargin),
        left:selectionPoint.x + tooltipOverhang,
        width:'fit-content',
        color:'black',
        display: (selection === '') ? 'none' : 'flex',
        flexDirection:'column',
        borderRadius:5,
        justifyContent:'center',
        border:'2px solid rgba(146, 148, 248, 0.8)',
        padding:'2px 5px 2px 5px',
        visibility:(tooltipState === TooltipState.SHOWN) ? 'visible' : 'hidden',
        }}>
        <h1>Search for cards with <span style={{fontWeight:'bold', color:'rgba(146, 148, 248, 1)'}}>{selection}</span> in their {selectionField}</h1>
      </div>
    </div>
  )
};

export default memo(Modal);