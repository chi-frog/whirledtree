'use client';

import { memo, useMemo, useRef } from "react";
import { searchFields } from "../CardTooltip";
import { MagicCard } from "../types/default";
import OracleText from "../OracleText";
import { MagicSymbol } from "../types/magic";
import CardName from "./CardName";

type Props = {
  card:MagicCard,
  expanded:boolean,
  symbols:MagicSymbol[],
};
const CardInfo:React.FC<Props> = ({
  card,
  expanded,
  symbols,
}) => {
  const available = !(!card || (card.reversed && !card.back));
  console.log('card', card)
  console.log('available', available)
  console.log('expanded', expanded)
  const divRef = useRef<HTMLDivElement|null>(null);

  const types = useMemo(() => {
    const typeLine = (!card?.reversed) ? card?.typeLine :
                                         card?.back?.typeLine;
    return (typeLine) ? typeLine?.split(' ') : [""];
  }, [card.typeLine, card.reversed]);

  const oracleText:[string, string] = useMemo(() =>
    (!card)      ? ["", ""] :
    (!card.back) ? [card.oracleText, ""] :
                   [card.oracleText, card.back.oracleText]
  , [card.oracleText, card.reversed]);
  
  const power = useMemo(() =>
    (!card)          ? null :
    (!card.reversed) ? card.power :
    (!card.back)     ? null :
                       card.back.power,
    [card.power, card.reversed])
  
  const toughness = useMemo(() =>
    (!card)          ? null :
    (!card.reversed) ? card.toughness :
    (!card.back)     ? null :
                       card.back.toughness,
    [card.toughness, card.reversed]);

  return (
    <div id="cardInformation"
      ref={divRef}
      style={{
        flexGrow:1,
        flexDirection:'column',
        overflowX:'hidden',
        overflowY:'scroll',
        textWrap:'wrap',
        padding:(expanded && available) ? '10px' : '0px',
        minWidth:0,
        width:(expanded && available) ? '100%' : '0px',
        transition:'padding 0.2s ease-in-out, width 0.2s ease-in-out',
      }}>
      <CardName
        name={(!card.reversed) ? card.name : card.back?.name}
        manaCost={(!card.reversed) ? card.manaCost : card.back?.manaCost}
        symbols={symbols}/>
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

export default memo(CardInfo);