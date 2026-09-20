'use client';

import { SelectionUpdateFunction, SKey } from "@/hooks/magic/useSelection";
import { SelectionChangeFunc, useSelectionContext } from "../general/SelectionProvider";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";
import Tooltip, { createSearchTooltip, findNearestField, getField, tooltipMargin, } from "../general/Tooltip";

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
      console.log('Clearing (' + e.rangeCount + ')', divRef.current);
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
      console.warn('startField:', startField);
      console.warn('endField:', endField);
      console.warn('selectionBox:', selectionBox);
      e.removeAllRanges();
      clear();
      return;
    }

    console.log('shouldnt be here', selection);
  
    let x = selectionBox.x;
    const y = selectionBox.y;
    const windowWidth = window.innerWidth;
  
    let property = findNearestField(e.anchorNode);
    if (!property) {
      console.warn('property', property);
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