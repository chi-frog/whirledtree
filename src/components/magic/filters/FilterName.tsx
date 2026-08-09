'use client'

import { ChangeEventHandler, memo } from "react";
import FilterOption from "./FilterOption";

type Props = {
  selectedNames:string[],
  onChangeName:ChangeEventHandler,
}

const FilterName:React.FC<Props> = ({
    selectedNames=[],
    onChangeName,
  }:Props) => (
  <FilterOption text="Name">
    <input type="text"
    className="bg-white hover:bg-sky-200"
      name="name"
      onChange={onChangeName}
      value={selectedNames[0]}
      style={{
        transition:'background-color 0.1s ease-in-out',
        borderRadius:'5px',
        padding:'5px',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
      }}/>
  </FilterOption>);

  export default memo(FilterName);