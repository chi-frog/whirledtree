'use client'

import { ChangeEventHandler, useMemo } from "react";
import { _magicFormatAny, MagicFormat } from "../types/default";
import FilterOption from "./FilterOption";
import { ANY } from "@/hooks/magic/useFilters";

type Props = {
  formats:MagicFormat[],
  selectedFormat?:string,
  onChangeFormat:ChangeEventHandler,
}

export const FilterFormat:React.FC<Props> = ({
    formats,
    selectedFormat=ANY,
    onChangeFormat,
  }:Props) => {

  formats = useMemo(() => [_magicFormatAny].concat(formats), [formats]);
    
  return (
  <FilterOption text="Format">
    <select id="format"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="format"
      value={selectedFormat}
      onChange={onChangeFormat}
      style={{
        cursor:'pointer',
        borderRadius:'5px',
        padding:'5px',
        textAlign:'center',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
        transition:'background-color 0.1s ease-in-out',
      }}>
      {formats.map((_format, _index) => {
        const className = (_format.name !== selectedFormat) ? "notselected" : "selected";
        const displayText = (_format.name !== ANY) ? _format.name : "Any";

        return (
          <option className={className} key={_index} value={_format.name}>{displayText}</option>
      )})}
    </select>
  </FilterOption>)};