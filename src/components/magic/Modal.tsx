'use client'

import { PointerEventHandler, useEffect, useRef, useState } from "react";
import { MagicCard } from "./types/default";
import { SelectionChangeFunc, useSelectionContext } from "@/app/page";
import { ImagePacket } from "./SearchResults";
import { Card } from "./Card";

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
  card:MagicCard|null,
  index:number,
  imagePacket?:ImagePacket,
}

const tooltipMargin = 5;

const Modal:React.FC<Props> = ({
    close,
    card,
    index,
    imagePacket
  }:Props) => {
  const [selection, setSelection] = useState<string>("");
  const [selectionPoint, setSelectionPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [tooltipState, setTooltipState] = useState<TooltipState>(TooltipState.HIDDEN);
  const [tooltipOverhang, setTooltipOverhang] = useState<number>(0);
  const [tooltipHovered, setTooltipHovered] = useState<boolean>(false);
  const {subSelection} = useSelectionContext();
  const ref = useRef(null);
  const divRef = useRef(null);

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
    console.log('Searching for ', selection);
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
        zIndex:20,
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
            x={0}
            y={0}
            widthString={'fit-content'}
            heightString={'100%'}
            imageHeightString={'100%'}
            card={card}
            imagePacket={imagePacket}
            index={index}
            dragging={false}
            isDragging={false}
          />
        }
        <div id="text" style={{
          flexGrow:1,
        }}>
          <h3
            style={{
            marginTop:'30px',
            fontSize:'24px',
            fontWeight:'bold',
          }}>{card?.name}</h3>
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