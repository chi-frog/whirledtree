'use client'

import { ChangeEventHandler } from "react";
import { MagicFormat } from "../types/default";
import FilterOption from "./FilterOption";

type Props = {
  formats:MagicFormat[],
  selectedFormat:string,
  onChangeFormat:ChangeEventHandler,
}

export const FilterFormat:React.FC<Props> = ({
    formats,
    selectedFormat,
    onChangeFormat,
  }:Props) => (
  <FilterOption text="Format">
    <select id="format"
      className="bg-white hover:bg-sky-200 [&>.notselected]:bg-white [&>.selected]:bg-sky-200"
      name="format"
      value={selectedFormat}
      onChange={onChangeFormat}
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
  </FilterOption>);