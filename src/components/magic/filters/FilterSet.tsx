'use client'

import { ChangeEventHandler, memo, useMemo } from "react";
import { _magicSetAny, MagicSet } from "../types/default";
import FilterOption from "./FilterOption";

type Props = {
  sets:MagicSet[],
  selectedSets:string[],
  onChangeSet:ChangeEventHandler,
}

const FilterSet:React.FC<Props> = ({
    sets,
    selectedSets=[],
    onChangeSet,
  }:Props) => {

  sets = useMemo(() => [_magicSetAny].concat(sets), [sets]);

  return (
  <FilterOption text="Set">
    <select multiple id="set" autoComplete="on"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="set" value={selectedSets} onChange={onChangeSet}
      style={{
        cursor:'pointer',
        borderRadius:'5px',
        padding:'5px',
        textAlign:'center',
        transition:'background-color 0.1s ease-in-out',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
      }}>
      {sets.map((_set, _index) => {
        const className = !(selectedSets.includes(_set.acronym)) ? "notselected" : "selected";
        const displayText = (_set.name !== '') ? _set.name : "Any Set";

        return (
          <option className={className} key={_index} value={_set.acronym}>{displayText}</option>
      )})}
    </select>
  </FilterOption>)
};

export default memo(FilterSet);