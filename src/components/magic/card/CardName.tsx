'use client';

import { findAllIndices } from "@/helpers/arrays";
import { useRef, useMemo, useState, useLayoutEffect } from "react";
import { searchFields } from "../CardTooltip";
import ManaSymbol from "./ManaSymbol";
import { MagicSymbol } from "../types/magic";

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
  const containerRef = useRef<HTMLDivElement|null>(null); // the width-constrained parent
  const nameRef = useRef<HTMLDivElement|null>(null);       // the row being scaled
  const [scale, setScale] = useState(1);

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

useLayoutEffect(() => {
  const container = containerRef.current;
  const row = nameRef.current;
  if (!container || !row) return;

  let cancelled = false;

  const fit = () => {
    if (cancelled) return;
    // offsetWidth/clientWidth ignore transforms, so no reset needed.
    const natural = row.scrollWidth;
    const available = container.clientWidth;
    if (natural <= 0 || available <= 0) return;
    setScale(Math.min(1, available / (natural)));
  };

  fit();

  // One-time re-fit once fonts and images have settled.
  const images = Array.from(row.querySelectorAll("img"));
  Promise.all([
    document.fonts.ready,
    ...images.map((img) => img.decode().catch(() => {})),
  ]).then(fit);

  const observer = new ResizeObserver(fit);
  observer.observe(container);
  observer.observe(row);

  return () => {
    cancelled = true;
    observer.disconnect();
  };
}, [name, manaCost, manaSymbols]);


  return (
    <div
  ref={containerRef}
  style={{
    width: "100%",
    overflow: "hidden",
  }}>
  <div
    ref={nameRef}
    className="nameDiv"
    style={{
      display: "flex",
      flexDirection: "row",
      marginTop: 28,
      alignItems: "center",
      width:(scale === 1) ? '100%': 'max-content',
      whiteSpace: "nowrap",
      transform: `scale(${scale})`,
      transformOrigin: "left center",
      transition: "transform 0.1s ease-out",
      justifyContent:'center',
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
      }}
    >
      {manaSymbols.map((symbol, index) => (
        <ManaSymbol
          key={index}
          symbol={symbol}
        />
      ))}
    </div>
  </div>
</div>
  );
};

export default CardName;