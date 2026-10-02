'use client';

import { SelectionUpdateFunction, SKey } from "@/hooks/magic/useSelection";
import { SelectionChangeFunc, useSelectionContext } from "../general/SelectionProvider";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";
import Tooltip, { findNearestField, getField, tooltipMargin, } from "../general/Tooltip";
import { renderToStaticMarkup } from "react-dom/server";

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

type Props = {
  visible:boolean,
  setVisible:Dispatch<SetStateAction<boolean>>,
  divRef:RefObject<HTMLDivElement|null>,
  updateSelected:SelectionUpdateFunction,
};
const CardTooltip:React.FC<Props> = ({
  visible,
  setVisible,
  divRef,
  updateSelected,
}) => {
  const [selection, setSelection] = useState<string>("");
  const [selectionField, setSelectionField] = useState<string>("");
  const [selectionPoint, setSelectionPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [tooltipOverhang, setTooltipOverhang] = useState<number>(0);
  const {subSelection} = useSelectionContext();

  const clear = () => {
    setSelection('');
    setVisible(false);
    setSelectionField("");
  }

  const onSelectionChange:SelectionChangeFunc = (e) => {
    const newSelection = e.toString();
    console.log('New Selection:' + newSelection, selection);

    if ((newSelection === '') ||
        (!divRef.current) ||
        (e.rangeCount === 0)) {
      clear();
      return;
    }
  
    const range = e.getRangeAt(0);
    const selectionBox = range.getBoundingClientRect();
    const startField = getField(range.startContainer);
    const endField = getField(range.endContainer);
  
    // No zone found, or selection spans two different zones -> reject it
    if ((!startField) ||
        (!endField) ||
        (startField !== endField) ||
        (!selectionBox)) {
      e.removeAllRanges();
      clear();
      return;
    }
  
    let x = selectionBox.x;
    const y = selectionBox.y;
    const windowWidth = window.innerWidth;
  
    let property = findNearestField(e.anchorNode);
    if (!property) {
      e.removeAllRanges();
      clear();
      return;
    }
    
    const testTooltip = createSearchTooltip({
      selection: newSelection,
      selectionPoint: {x, y},
      selectionField: property,
      tooltipMargin,
    });
  
    (divRef.current as HTMLElement).appendChild(testTooltip);
  
    const overhang = (windowWidth - (x + testTooltip.offsetWidth + 2));
  
    testTooltip.remove();
  
    setSelectionPoint({x:x, y:y});
    setTooltipOverhang(overhang < 0 ? overhang : 0);  
    setSelection(newSelection);
    setSelectionField(property);
    setVisible(true);
  };
  
  useEffect(() => subSelection({tag:'modal', onSelectionChange}), []);

  return (
    <Tooltip
      visible={visible}
      updateSelected={updateSelected}
      selection={selection}
      selectionPoint={selectionPoint}
      selectionField={selectionField}
      overhang={tooltipOverhang}
      />
  )
};

export default CardTooltip;