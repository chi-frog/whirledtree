'use client';

import { findAllIndices } from "@/helpers/arrays";
import { useMemo, } from "react";
import ManaSymbol from "./ManaSymbol";
import { MagicSymbol } from "../types/magic";
import ResizeContainer from "@/components/general/ResizeContainer";

const beginningName = 45/934;
const endingName = 96/934;

type Props = {
  name:string|undefined,
  manaCost:string|undefined,
  symbols:MagicSymbol[],
};
const CardName:React.FC<Props> = ({
  name,
  manaCost,
  symbols,
}) => {
  const manaSymbols = useMemo(() => {
    if (!manaCost) return [];
    let leftBrackets:number[] = findAllIndices(manaCost, '{');
    let rightBrackets:number[] = findAllIndices(manaCost, '}');
    let manaSymbols = [];
    let currentIndex = 0;

    while (currentIndex < leftBrackets.length) {
      let symbol = symbols.find((symbol) =>
        (symbol.symbol === manaCost.substring(leftBrackets[currentIndex], rightBrackets[currentIndex]+1)));
      if (!symbol) break;

      manaSymbols.push(symbol);
      currentIndex++;
    }

    return manaSymbols;
  }, [manaCost, symbols]);


  return (
    <ResizeContainer
      style={{
        marginTop:11,
      }}>
      <h3
        className="selectable name"
        data-field="name"
        style={{
          fontSize: 30,
          fontWeight: "bold",
          paddingRight: 10,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
        {name}
      </h3>
      <div
        className="selectable mana"
        data-field="mana"
        style={{
          display: "flex",
          width: "fit-content",
          minWidth: 0,
          flexShrink: 0,
        }}>
        {manaSymbols.map((symbol, index) => (
        <ManaSymbol
          key={index}
          symbol={symbol}
          />
        ))}
      </div>
    </ResizeContainer>
  );
};

export default CardName;