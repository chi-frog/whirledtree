'use client'

import { PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, } from "./types/default";
import { ImagePacket } from "./CardDisplay";
import { Card } from "./Card";
import { SelectionChangeFunc, useSelectionContext } from "../general/SelectionProvider";
import { _dragState, } from "../general/DragProvider";
import { _wpoint, } from "@/helpers/wpoint";
import { FilterUpdateFunction } from "@/hooks/magic/useFilters";
import OracleText from "./OracleText";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";

enum TooltipState {
  HIDDEN='hidden',
  PENDING='pending',
  SHOWN='shown',
}

type SearchTooltipProps = {
  selection:string,
  selectionPoint:{x:number, y:number},
  tooltipMargin:number,
}
function createSearchTooltip({
  selection,
  selectionPoint,
  tooltipMargin,
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

  h1.append(span, " in their name");
  div.appendChild(h1);

  return div;
}

type Props = {
  close:()=>void,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  cards:MagicCard[],
  changeCard:(index:number, card:MagicCard)=>void,
  updateSelected:FilterUpdateFunction,
  index:number,
  imagePackets:ImagePacket[],
}

const tooltipMargin = 5;

const Modal:React.FC<Props> = ({
    close,
    symbols,
    symbolImageMap,
    cards,
    changeCard,
    updateSelected,
    index,
    imagePackets
  }:Props) => {
  const [selection, setSelection] = useState<string>("");
  const [selectionPoint, setSelectionPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [tooltipState, setTooltipState] = useState<TooltipState>(TooltipState.HIDDEN);
  const [tooltipOverhang, setTooltipOverhang] = useState<number>(0);
  const [tooltipHovered, setTooltipHovered] = useState<boolean>(false);
  const {subSelection} = useSelectionContext();
  const ref = useRef(null);
  const divRef = useRef(null);
  const nameRef = useRef(null);

  const card = cards[index];

  const onSelectionChange:SelectionChangeFunc = (e) => {
    const newSelection = e.toString();

    if (newSelection === '') {
      setSelection(newSelection);
      setTooltipState(TooltipState.HIDDEN);
      return;
    }
    if (newSelection === selection) return;
    if (!ref.current) return;
    if (!divRef.current) return;

    const range = e.getRangeAt(0);
    const selectionBox = range?.getBoundingClientRect();

    if (selectionBox) {
      let x = selectionBox.x;
      const y = selectionBox.y;
      const windowWidth = window.innerWidth;

      const testTooltip = createSearchTooltip({
        selection: newSelection,
        selectionPoint,
        tooltipMargin,
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
    updateSelected({property:'name', value:selection});
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
  , [card.reversed]);

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

  const power = useMemo(() => {
    if (card.reversed) {
      if (!card.back) return null;
      else return card.back.power;
    } else
      return card.power;
  }, [card.power, card.reversed]);

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
      <div id="inner" style={{
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
        {card &&
          <Card
            location='modal'
            widthString={'fit-content'}
            heightString={'100%'}
            imageHeightString={'100%'}
            card={card}
            changeCard={changeCard.bind(null, index)}
            imagePackets={imagePackets}
            handlePointerUp={handleCardPointerUp}
          />
        }
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
            style={{
            fontSize:nameFontSize,
            fontWeight:'bold',
            paddingRight:'10px',
          }}>{(!card?.reversed) ? card?.name :
                                  card?.back?.name}</h3>
          {...manaCostImages?.map((symbol, index) => (
            <img key={index} src={symbol.imageUri} alt={symbol.symbol} className="icon" 
             title="Search By Mana Cost" style={{
              width:'24px',
              height:'24px',
              borderRadius:'50%',
              boxShadow:'-0.8px 1.5px black',
              margin:'1px',
            }}/>
          ))}
          </div>
          <h3 className="selectable typeLine" title="Search By Type"
            style={{
            fontSize:'20px',
            fontWeight:'bold',
          }}>{(!card?.reversed) ? card?.typeLine :
                                  card?.back?.typeLine}</h3>
          <OracleText
            oracleText={oracleText}
            symbols={symbols}
            symbolImageMap={symbolImageMap}/>
          {power && toughness &&
          <h3 className="selectable powerAndToughness" title="Search By Power/Toughness"
            style={{
            fontSize:'30px',
            fontWeight:'bold',
          }}>{power}/{toughness}</h3>
          }
        </div>
      </div>
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
        <h1>Search for cards with <span style={{fontWeight:'bold', color:'rgba(146, 148, 248, 1)'}}>{selection}</span> in their name</h1>
      </div>
    </div>
  )
};

export default Modal;