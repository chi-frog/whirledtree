'use client'

import { ChangeEventHandler, MouseEventHandler } from "react";
import { MagicCard, MagicFormat, MagicSet } from "../types/default";
import { FilterState } from "../SearchResults";

export const yCutoffHidden = 10;
export const yCutoffWhole = 200;

type Props = {
  handleMouseDown:MouseEventHandler,
  handleMouseUp:MouseEventHandler,
  state:FilterState,
  dragPoint:{x:number, y:number},
  dragLocation:{x:number, y:number},
  glow:number,
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

const FiltersBar:React.FC<Props> = ({
  handleMouseDown,
  handleMouseUp,
  state,
  dragPoint,
  dragLocation,
  glow,
  numCardsRow,
  onChangeNumCardsRow,
  selectedSets,
  onChangeSet,
  selectedFormats,
  onChangeFormat,
  cards,
  sets,
  formats}:Props) => {

  const dragging = (state === FilterState.REDUCED_DRAGGING) ||
                   (state === FilterState.HIDDEN_DRAGGING);
  const hidden = (state === FilterState.HIDDEN) ||
                 (state === FilterState.HIDDEN_PRESSED) ||
                 (state === FilterState.HIDDEN_DRAGGING);
  const whole = (state === FilterState.WHOLE);

  return (<>
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
      position:'fixed',
      top: (state === FilterState.HIDDEN_DRAGGING) ? `${-50 + (yCutoffHidden - dragPoint.y) + dragLocation.y}px` :
           (hidden) ? `${-50 + glow + dragLocation.y}px` :
           (whole)  ? `${20 + dragLocation.y}px` :
                      `${dragLocation.y}px`,
      left: (whole) ? `${20 + dragLocation.x}px` :
                      `${5 + dragLocation.x}px`,
      width: (whole) ? 'calc(100vw - 40px)' : 'calc(100% - 10px)',
      height:(whole) ? 'calc(100vh - 40px)' : '50px',
      border: '2px solid black',
      padding:'5px',
      color: 'black',
      zIndex: '10',
      cursor:(dragging) ? 'grabbing' :
                          'pointer',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-evenly',
      gap:'5px',
      borderRadius:'5px',
      boxShadow: (hidden) ?
        `0px 0px ${glow*2}px ${glow*2}px rgba(146, 148, 248, 0.4)` :
        `inset 0px 0px ${glow}px ${glow}px rgba(256, 44, 44, 0.8)`,
      backgroundColor: (whole) ? 'rgba(255, 255, 255, 0.85)' : 'white',
      transition: (dragging) ? "box-shadow 0.1s ease-in-out" :
                               "box-shadow 0.1s ease-in-out, top 0.1s ease-in-out, left 0.1s ease-in-out",
      }}>
      <label>
        Cards Per Row: <input className="hover:bg-sky-200 bg-white" name="cardsPerRow" type="number" style={{
          width:'fit-content',
          textAlign:'center',
          borderRadius:'5px',
          backgroundColor:'white',
          transition:"background-color 0.1s ease-in-out",
          }}
          defaultValue={numCardsRow} onChange={onChangeNumCardsRow}
          onMouseDown={(e)=>e.stopPropagation()}
          max={cards.length} min={1}/>
      </label>
      <label style={{display:'flex'}}>
        <h1 style={{fontWeight:'bold', cursor:(dragging) ? 'grabbing' : 'auto'}}>Set: </h1>
        <select id="set"
          className={"hover:bg-sky-200 [&>option]:bg-white"}
          name="set" value={selectedSets[0]} onChange={onChangeSet}
          onMouseDown={(e)=>e.stopPropagation()} style={{
          cursor:'pointer',
          borderRadius:'5px',
          padding:'2px 5px 2px 5px',
          backgroundColor:'white',
          transition:'background-color 0.1s ease-in-out',
          boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
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
                    backgroundColor:'white',
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