'use client'

import { ChangeEventHandler } from "react";
import { MagicSet } from "../types/default";
import FilterOption from "./FilterOption";

type Props = {
  sets:MagicSet[],
  selectedSet:string,
  onChangeSet:ChangeEventHandler,
}

export const FilterSet:React.FC<Props> = ({
    sets,
    selectedSet,
    onChangeSet,
  }:Props) => (
  <FilterOption text="Set">
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
);