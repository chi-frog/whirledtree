'use client'

import { ChangeEventHandler } from "react";
import FilterOption from "./FilterOption";

type Props = {
  selectedType?:string,
  onChangeType:ChangeEventHandler,
}

export const FilterType:React.FC<Props> = ({
    selectedType="",
    onChangeType,
  }:Props) => (
  <FilterOption text="Type">
    <input type="text"
    className="bg-white hover:bg-sky-200"
      name="name"
      onChange={onChangeType}
      value={selectedType}
      style={{
        transition:'background-color 0.1s ease-in-out',
        borderRadius:'5px',
        padding:'2px 5px 2px 5px',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
      }}/>
  </FilterOption>);