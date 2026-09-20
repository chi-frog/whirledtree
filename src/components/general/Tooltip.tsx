'use client'

import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import { memo, PointerEventHandler, useMemo, useRef, useState } from "react";
import { searchFields } from "../magic/CardTooltip";
import { renderToStaticMarkup } from "react-dom/server";

export const tooltipMargin = 5;

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
export function createSearchTooltip({
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

export function getField(node:Node|null):Element|null {
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
};

type Props = {
  visible:boolean,
  updateSelected:FilterUpdateFunction,
  selection:string,
  selectionPoint:{x:number, y:number},
  selectionField:string,
  overhang:number,
};

const Tooltip:React.FC<Props> = ({
  visible,
  updateSelected,
  selection,
  selectionPoint,
  selectionField,
  overhang,
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

    updateSelected({property:property as keyof Selected, value:selection});
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
      (selectionField === searchFields.oracleText) ?
        (<h1>Search for cards with {span} in their oracle text.</h1>) :
        (<h1>Search for cards with {span} in their {selectionField}</h1>);


    return text;
  }, [selection, selectionField]);

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
        visibility:(visible) ? 'visible' : 'hidden',
        }}>
        {tooltipText}
      </div>
  )
};

export default memo(Tooltip);