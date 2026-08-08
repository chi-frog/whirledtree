'use client'

import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import { memo, PointerEventHandler, useMemo, useRef, useState } from "react";
import { findNearestField, searchFields } from "./Modal";

export const tooltipMargin = 5;

export enum TooltipState {
  HIDDEN='hidden',
  PENDING='pending',
  SHOWN='shown',
};

type Props = {
  updateSelected:FilterUpdateFunction,
  selection:string,
  selectionPoint:{x:number, y:number},
  selectionField:string,
  overhang:number,
  state:TooltipState,
};

const Tooltip:React.FC<Props> = ({
  updateSelected,
  selection,
  selectionPoint,
  selectionField,
  overhang,
  state,
}) => {
  const [tooltipHovered, setTooltipHovered] = useState<boolean>(false);
  const ref = useRef(null);

  const handleTooltipPointerDown:PointerEventHandler = (e) => {
    const docSelection = document.getSelection();
    if (!docSelection) return;
  
    const property = findNearestField(docSelection.anchorNode);
    if (!property) {
      console.error("Invalid Property:", property);
      return;
    }

    updateSelected({property:property as keyof Selected, value:[selection]});
    document.getSelection()?.empty();
  };

  const handleTooltipPointerEnter:PointerEventHandler = (e) => {
    setTooltipHovered(true);
  };

  const handleTooltipPointerLeave:PointerEventHandler = (e) => {
    setTooltipHovered(false);
  };

  const tooltipText = useMemo(() => {
    const span = (<span style={{fontWeight:'bold', color:'rgba(146, 148, 248, 1)'}}>{selection}</span>);
    const text =
      (selectionField === searchFields.oracle) ?
        (<h1>Search for cards with {span} in their oracle text.</h1>) :
        (<h1>Search for cards with {span} in their {selectionField}</h1>);


    return text;
  }, [selection]);

  return (
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
        left:selectionPoint.x + overhang,
        width:'fit-content',
        color:'black',
        display: (selection === '') ? 'none' : 'flex',
        flexDirection:'column',
        borderRadius:5,
        justifyContent:'center',
        border:'2px solid rgba(146, 148, 248, 0.8)',
        padding:'2px 5px 2px 5px',
        visibility:(state === TooltipState.SHOWN) ? 'visible' : 'hidden',
        }}>
        {tooltipText}
      </div>
  )
};

export default memo(Tooltip);