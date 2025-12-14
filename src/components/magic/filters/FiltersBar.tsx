'use client'

import { ChangeEventHandler, MouseEventHandler } from "react";
import { MagicCard, MagicFormat, MagicSet } from "../types/default";

type Props = {
  handleFiltersMouseDown:MouseEventHandler,
  optionsDragging:boolean,
  optionsShown:boolean,
  optionsDragPoint:{x:number, y:number},
  optionsDragLocation:{x:number, y:number},
  optionsIntensity:number,
  numCardsRow:number,
  onChangeNumCardsRow:ChangeEventHandler,
  selectedSets:string[],
  onChangeSet:ChangeEventHandler,
  selectedFormats:string[],
  onChangeFormat:ChangeEventHandler,
  sets:MagicSet[],
  cards:MagicCard[],
  formats:MagicFormat[],
};

const FiltersBar:React.FC<Props> = (
  {handleFiltersMouseDown,
  optionsDragging,
  optionsShown,
  optionsDragPoint,
  optionsDragLocation,
  optionsIntensity,
  numCardsRow,
  onChangeNumCardsRow,
  selectedSets,
  onChangeSet,
  selectedFormats,
  onChangeFormat,
  cards,
  sets,
  formats}:Props) => {

  return (<>
    <div
      onMouseDown={handleFiltersMouseDown}
      style={{
      position:'fixed',
      top: (optionsDragging && !optionsShown) ? `${-50 + (15 - optionsDragPoint.y) + optionsDragLocation.y}px` :
           (!optionsShown) ?   `${-50 + optionsIntensity + optionsDragLocation.y}px` :
                              `${optionsDragLocation.y}px`,
      left:`${5 + optionsDragLocation.x}px`,
      width:'calc(100% - 10px)',
      border: '2px solid black',
      padding:'5px',
      color: 'black',
      zIndex: '10',
      cursor:(optionsDragging) ? 'grabbing' :
             (!optionsShown) ?   'pointer' :
                                 'pointer',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-evenly',
      gap:'5px',
      borderRadius:'5px',
      height:'50px',
      boxShadow: (!optionsShown) ?
        `0px 0px ${optionsIntensity}px ${optionsIntensity}px rgba(146, 148, 248, 0.4)` :
        `0px 0px ${optionsIntensity}px ${optionsIntensity}px rgba(256, 44, 44, 0.8)`,
      backgroundColor:'white',
      transition: (optionsDragging) ? "box-shadow 0.1s ease-in-out" :
                                      "box-shadow 0.1s ease-in-out, top 0.1s ease-in-out, left 0.1s ease-in-out",
      }}>
      <label>
        Cards Per Row: <input className="hover:bg-sky-200 bg-white" name="cardsPerRow" type="number" style={{
          width:'fit-content',
          textAlign:'center',
          borderRadius:'5px',
          transition:"background-color 0.1s ease-in-out",
          }}
          defaultValue={numCardsRow} onChange={onChangeNumCardsRow}
          onMouseDown={(e)=>e.stopPropagation()}
          max={cards.length} min={1}/>
      </label>
      <label>
        Set: <select id="set"
               className={"hover:bg-sky-200 [&>option]:bg-white"}
               name="set" value={selectedSets[0]} onChange={onChangeSet}
               onMouseDown={(e)=>e.stopPropagation()} style={{
                cursor:'pointer',
                borderRadius:'5px',
                padding:'2px',
                transition:'background-color 0.1s ease-in-out',
                }}>
                {sets.map((_set, _index) => (
                  <option key={_index} value={_set.acronym}>{_set.name}</option>
                ))}
              </select>
      </label>
      <label>
        Format: <select id="format"
                  className="hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
                  name="format" value={selectedFormats[0]} onChange={onChangeFormat}
                  onMouseDown={(e)=>e.stopPropagation()} style={{
                    cursor:'pointer',
                    borderRadius:'5px',
                    padding:'2px',
                    transition:'background-color 0.1s ease-in-out',
                  }}>
                  {formats.map((_format, _index) => (
                    (_format.name !== selectedFormats[0]) ?
                    <option className="notselected" key={_index} value={_format.name}>{_format.name}</option> :
                    <option className="selected" key={_index} value={_format.name}>{_format.name}</option>
                  ))}
                </select>
      </label>
      </div>
  </>);
};

export default FiltersBar;