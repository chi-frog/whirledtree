'use client'

import { ChangeEventHandler, useMemo } from "react";
import FilterOption from "./FilterOption";
import { ANY } from "@/hooks/magic/useFilters";

type Props = {
  types:string[],
  selectedType?:string,
  onChangeType:ChangeEventHandler,
}

export const FilterType:React.FC<Props> = ({
    types,
    selectedType="",
    onChangeType,
  }:Props) => { 

  types = useMemo(() => [ANY].concat(types), [types]);

  return (
  <FilterOption text="Type">
    <select id="set" autoComplete="on"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="set" value={selectedType} onChange={onChangeType}
      style={{
        cursor:'pointer',
        borderRadius:'5px',
        padding:'2px 5px 2px 5px',
        textAlign:'center',
        transition:'background-color 0.1s ease-in-out',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)'
      }}>
      {types.map((_type, _index) => {
        const className = (_type !== selectedType) ? "notselected" : "selected";
        const displayText = (_type !== ANY) ? _type : 'Any';

        return (
          <option className={className} key={_index} value={_type}>{displayText}</option> 
      )})}
    </select>
  </FilterOption>);}