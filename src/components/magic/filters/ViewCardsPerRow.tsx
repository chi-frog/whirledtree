'use client'

import { ChangeEventHandler } from "react"
import FilterOption from "./FilterOption"

type Props = {
  numCards:number,
  numCardsRow:number,
  onChangeNumCardsRow:ChangeEventHandler,
}

export const CardsPerRow:React.FC<Props> = 
    ({numCards,
     numCardsRow,
     onChangeNumCardsRow
    }:Props) => (
  <FilterOption text="Cards Per Row">
    <input
      className="bg-white hover:bg-sky-200"
      name="cardsPerRow"
      type="number"
      defaultValue={numCardsRow} onChange={onChangeNumCardsRow}
      max={numCards} min={1}
      style={{
        width:'fit-content',
        textAlign:'center',
        borderRadius:'5px',
        padding:'2px 5px 2px 5px',
        boxShadow:'inset 0px 0px 2px 2px rgba(146, 148, 248, 0.4)',
        transition:"background-color 0.1s ease-in-out",
      }}/>
  </FilterOption>);