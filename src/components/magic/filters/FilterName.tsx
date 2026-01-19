'use client'

import { ChangeEventHandler } from "react";
import FilterOption from "./FilterOption";

type Props = {
  selectedName:string,
  onChangeName:ChangeEventHandler,
}

export const FilterName:React.FC<Props> = ({
    selectedName,
    onChangeName,
  }:Props) => (
  <FilterOption text="Name">
    <input type="text"
    className="bg-white hover:bg-sky-200"
      name="name"
      onChange={onChangeName}
      value={selectedName}
      style={{
        transition:'background-color 0.1s ease-in-out',
        borderRadius:'5px',
        padding:'2px 5px 2px 5px',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
      }}/>
  </FilterOption>);