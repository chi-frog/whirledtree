'use client'

import { ChangeEventHandler, useMemo } from "react";
import { _magicSetAny, MagicSet } from "../types/default";
import FilterOption from "./FilterOption";
import { ANY } from "@/hooks/magic/useFilters";

type Props = {
  sets:MagicSet[],
  selectedSet?:string,
  onChangeSet:ChangeEventHandler,
}

export const FilterSet:React.FC<Props> = ({
    sets,
    selectedSet=ANY,
    onChangeSet,
  }:Props) => {

  sets = useMemo(() => [_magicSetAny].concat(sets), [sets]);

  return (
  <FilterOption text="Set">
    <select id="set" autoComplete="on"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="set" value={selectedSet} onChange={onChangeSet}
      style={{
        cursor:'pointer',
        borderRadius:'5px',
        padding:'5px',
        textAlign:'center',
        transition:'background-color 0.1s ease-in-out',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
      }}>
      {sets.map((_set, _index) => {
        const className = (_set.acronym !== selectedSet) ? "notselected" : "selected";
        const displayText = (_set.name !== ANY) ? _set.name : "Any";

        return (
          <option className={className} key={_index} value={_set.acronym}>{displayText}</option>
      )})}
    </select>
  </FilterOption>)
  };