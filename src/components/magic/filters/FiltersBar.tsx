'use client'

import { ChangeEventHandler, PointerEventHandler } from "react";
import { MagicCard, MagicFormat, MagicSet } from "../types/default";
import { FilterState } from "../SearchResults";
import FilterOption from "./FilterOption";

type Props = {
  yCutoffHidden:number,
  handlePointerDown:PointerEventHandler,
  handlePointerUp:PointerEventHandler,
  handleArrowPointerDown:PointerEventHandler,
  handleArrowPointerUp:PointerEventHandler,
  state:FilterState,
  dragPoint:{x:number, y:number},
  dragLocation:{x:number, y:number},
  glow:number,
  numCardsRow:number,
  onChangeNumCardsRow:ChangeEventHandler,
  selectedSet:string,
  onChangeSet:ChangeEventHandler,
  selectedFormat:string,
  onChangeFormat:ChangeEventHandler,
  selectedName:string,
  onChangeName:ChangeEventHandler,
  sets:MagicSet[],
  cards:MagicCard[],
  formats:MagicFormat[],
};

const FiltersBar:React.FC<Props> = ({
  yCutoffHidden,
  handleArrowPointerDown,
  handleArrowPointerUp,
  handlePointerDown,
  handlePointerUp,
  state,
  dragPoint,
  dragLocation,
  glow,
  numCardsRow,
  onChangeNumCardsRow,
  selectedSet,
  onChangeSet,
  selectedFormat,
  onChangeFormat,
  selectedName,
  onChangeName,
  cards,
  sets,
  formats}:Props) => {

  const hidden = (state === FilterState.HIDDEN);
  const reduced = (state === FilterState.REDUCED);
  const whole = (state === FilterState.WHOLE);

  const filterOptions = (<>
    <FilterOption text="Cards Per Row: ">
        <input className="bg-white hover:bg-sky-200" name="cardsPerRow" type="number" style={{
          width:'fit-content',
          textAlign:'center',
          borderRadius:'5px',
          padding:'2px 5px 2px 5px',
          boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
          transition:"background-color 0.1s ease-in-out",
          }}
          defaultValue={numCardsRow} onChange={onChangeNumCardsRow}
          max={cards.length} min={1}/>
      </FilterOption>
      <FilterOption text="Set: ">
        <select id="set" autoComplete="on"
          className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
          name="set" value={selectedSet} onChange={onChangeSet}
          style={{
            cursor:'pointer',
            borderRadius:'5px',
            padding:'2px 5px 2px 5px',
            textAlign:'center',
            transition:'background-color 0.1s ease-in-out',
            boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
          }}>
          {sets.map((_set, _index) => (
            (_set.acronym !== selectedSet) ?
              <option className="notselected" key={_index} value={_set.acronym}>{_set.name}</option> :
              <option className="selected" key={_index} value={_set.acronym}>{_set.name}</option>
          ))}
        </select>
      </FilterOption>
      <FilterOption text="Format: ">
        <select id="format"
          className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
          name="format" value={selectedFormat} onChange={onChangeFormat}
          style={{
            cursor:'pointer',
            borderRadius:'5px',
            padding:'2px 5px 2px 5px',
            textAlign:'center',
            boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
            transition:'background-color 0.1s ease-in-out',
          }}>
          {formats.map((_format, _index) => (
            (_format.name !== selectedFormat) ?
              <option className="notselected" key={_index} value={_format.name}>{_format.name}</option> :
              <option className="selected" key={_index} value={_format.name}>{_format.name}</option>
          ))}
        </select>
      </FilterOption>
      <FilterOption text="Name: ">
        <input name="name" className="bg-white hover:bg-sky-200" type="text"
          onChange={onChangeName}
          value={selectedName}
          style={{
          transition:'background-color 0.1s ease-in-out',
          borderRadius:'5px',
          padding:'2px 5px 2px 5px',
          boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
        }}/>
      </FilterOption>
  </>);

  const arrow = (
    <svg
      className={(whole) ? "hover:scale-130 hover:bg-gradient-to-b from-transparent to-light-red to-rgba[255, 255, 255, 0.8]" :
                           "hover:scale-130"}
      onPointerDown={handleArrowPointerDown} onPointerUp={handleArrowPointerUp}
      fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	    width="800px" height="800px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve" style={{
      alignSelf:'flex-end',
      width:'100%',
      height:'100%',
      cursor:'pointer',
      rotate:(whole) ? '180deg' : '0deg',
      transition:'scale 0.1s ease-in-out, background-color 0.1s ease-in-out',
      }}>
      <g>
	      <path d="M78.466,35.559L50.15,63.633L22.078,35.317c-0.777-0.785-2.044-0.789-2.828-0.012s-0.789,2.044-0.012,2.827L48.432,67.58
		    c0.365,0.368,0.835,0.563,1.312,0.589c0.139,0.008,0.278-0.001,0.415-0.021c0.054,0.008,0.106,0.021,0.16,0.022
		    c0.544,0.029,1.099-0.162,1.515-0.576l29.447-29.196c0.785-0.777,0.79-2.043,0.012-2.828S79.249,34.781,78.466,35.559z"/>
      </g>
    </svg>
  );

  return (<>
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
      position:'fixed',
      top: (hidden) ? `${-80 + glow}px` :
           (whole)  ? `${0}px` :
                      `${dragLocation.y}px`,
      left: (whole) ? `${20 + dragLocation.x}px` :
                      `${5 + dragLocation.x}px`,
      width: (whole) ? 'calc(100vw - 40px)' : 'calc(100% - 10px)',
      height:(whole) ? 'calc(100vh - 40px)' : '80px',
      border: '2px solid black',
      color: 'black',
      zIndex: '10',
      cursor:(reduced) ? 'pointer' : '',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-evenly',
      flexWrap:'wrap',
      borderRadius:'5px',
      boxShadow: (hidden)   ? `0px 0px ${glow*2}px ${glow*2}px rgba(146, 148, 248, 0.8)` :
                 (glow < 0) ? `inset 0px 0px ${-glow}px ${-glow}px rgba(256, 44, 44, 0.8)` :
                              `0px 0px ${glow}px ${glow}px rgba(146, 148, 248, 0.8)`,
                              
      backgroundColor: (whole) ? 'rgba(255, 255, 255, 0.85)' : 'white',
      transition: (false) ? "box-shadow 0.1s ease-in-out" :
                               "box-shadow 0.1s ease-in-out, top 0.1s ease-in-out, left 0.1s ease-in-out, height 0.1s ease-in-out",
      }}>
      <div style={{
        display:'flex',
        flexDirection:(!whole) ? 'row' : 'column',
        justifyContent:'space-evenly',
        alignItems:'center',
        overflow:'scroll',
        padding:'2px 5px 2px 5px',
        gap:'8px',
        height:(whole)?'calc(100vh - 40px - 30px)' : '50px', 
        }}>
        {filterOptions}
      </div>
      <div style={{
        width:'calc(100vw - 40px)',
        height:'30px',
        overflow:'hidden',
        }}>
        {arrow}
      </div>
    </div>
  </>);
};

export default FiltersBar;