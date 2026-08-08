'use client'

import { ChangeEventHandler, memo, useMemo } from "react";
import FilterOption from "./FilterOption";
import { ANY } from "@/hooks/magic/useFilters";

type Props = {
  types:string[],
  selectedTypes:string[],
  onChangeType:ChangeEventHandler,
}

const FilterType:React.FC<Props> = ({
    types,
    selectedTypes=[],
    onChangeType,
  }:Props) => { 

  types = useMemo(() => [''].concat(types), [types]);

  return (
  <FilterOption text="Type">
    <select multiple id="set" autoComplete="on"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="set" value={selectedTypes} onChange={onChangeType}
      style={{
        cursor:'pointer',
        borderRadius:'5px',
        padding:'5px',
        textAlign:'center',
        transition:'background-color 0.1s ease-in-out',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
      }}>
      {types.map((_type, _index) => {
        const className = !(selectedTypes.includes(_type)) ? "notselected" : "selected";
        const displayText = (_type !== '') ? _type : 'Any Type';

        return (
          <option className={className} key={_index} value={_type}>{displayText}</option> 
      )})}
    </select>
  </FilterOption>);}

export default memo(FilterType);