'use client'

import { ChangeEventHandler, memo, useMemo } from "react";
import { _magicFormatAny, MagicFormat } from "../types/default";
import FilterOption from "./FilterOption";
import { ANY } from "@/hooks/magic/useFilters";

type Props = {
  formats:MagicFormat[],
  selectedFormats:string[],
  onChangeFormat:ChangeEventHandler,
}

const FilterFormat:React.FC<Props> = ({
    formats,
    selectedFormats=[],
    onChangeFormat,
  }:Props) => {

  formats = useMemo(() => [_magicFormatAny].concat(formats), [formats]);
    
  return (
  <FilterOption text="Format">
    <select multiple id="format"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="format"
      value={selectedFormats}
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
        const className = !(selectedFormats.includes(_format.name)) ? "notselected" : "selected";
        const displayText = (_format.name !== '') ? _format.name : "Any Format";

        return (
          <option className={className} key={_index} value={_format.name}>{displayText}</option>
      )})}
    </select>
  </FilterOption>)};

export default memo(FilterFormat);