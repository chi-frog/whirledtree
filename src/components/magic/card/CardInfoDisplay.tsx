'use client';

import { useMemo, useRef } from "react";
import { searchFields } from "../CardTooltip";
import { MagicCard } from "../types/default";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import OracleText from "../OracleText";

type Props = {
  card:MagicCard,
  expanded:boolean,
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>
};

const CardInfoDisplay:React.FC<Props> = ({
  card,
  expanded,
  symbols,
  symbolImageMap,
}) => {
  const nameRef = useRef<HTMLDivElement|null>(null);

  const nameFontSize = useMemo(() => {
    return 30;
  }, [card.name, card.reversed]);

  const manaCostImages = useMemo(() => {
    if (!card) return [];

    let face = (card.reversed) ? card.back : card;
    if ((!face) ||
        !(face.manaCost)) return [];

    const manaCost = face.manaCost;
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

  const oracleText:[string, string] = useMemo(() =>
    (!card)      ? ["", ""] :
    (!card.back) ? [card.oracleText, ""] :
                   [card.oracleText, card.back.oracleText]
  , [card.oracleText]);
  
  const power = useMemo(() =>
    (card.reversed) ?
      (!card.back) ? null :
                      card.back.power :
      card.power, [card.power, card.reversed])
  
    const toughness = useMemo(() => {
      if (card?.reversed) {
        if (!card.back) return null;
        else return card.back.toughness;
      } else
        return card?.toughness;
    }, [card?.toughness, card?.reversed]);

  return (
    <div id="cardInformation"
      style={{
        flexGrow:1,
        flexDirection:'column',
        overflowX:'hidden',
        overflowY:'scroll',
        textWrap:'wrap',
        width:(expanded) ? 'auto' : '0px',
      }}>
      <div className="nameDiv" ref={nameRef}
        style={{
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
          data-field={searchFields.manaValue}
          style={{
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
        <h3 className="selectable type"
          data-field={searchFields.type}
          style={{
            fontSize:'20px',
            fontWeight:'bold',
          }}>
          {...types.reduce((_result, _type, _index) => {
            let jsx;
    
            if (_type === "—") jsx = (
              <span key="-"
                style={{
                  userSelect:'none',
                  marginRight:'5px',
                }}>
                -
              </span>);
            else jsx = (
              <span key={_type} className="selectableBit"
                style={{
                  userSelect:'all',
                  marginRight:(_index !== types.length - 1) ? '5px' : '0px',
                }}>
                {_type}
              </span>);

            return _result.concat(jsx);
          }, [] as React.JSX.Element[])}
        </h3>
      </div>
      {(oracleText) &&
        <div className="selectable oracle" title="Search By Oracle Text"
          data-field={searchFields.oracleText}>
          <OracleText
            oracleText={(card.reversed) ? oracleText[1] : oracleText[0]}
            symbols={symbols}/>
      </div>}
      {power && toughness &&
      <div title="Search By Power/Toughness"
        style={{
          display:'flex',
          justifyContent:'center',
        }}>
        <h3 className="selectable powerAndToughness"
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
      </div>}
    </div>)};

export default CardInfoDisplay