'use client'

import { GAME_TYPE } from "@/components/magic/types/magic";
import { useCallback, useMemo, useState } from "react";

export const maxSections = 5;

export type Selected = {
  game:string[],
  name:string[],
  format:string[],
  set:string[], //acronym
  type:string[],
  power:string[],
  toughness:string[],
  oracleText:string[],
  manaValue:string[],
}
export type SKey = keyof Selected;

export const defaultSelected = {
  game:[GAME_TYPE.PAPER, GAME_TYPE.MTGO, GAME_TYPE.ARENA],
  name:[''],
  format:[''],
  set:[''],
  type:[''],
  power:[''],
  toughness:[''],
  oracleText:[''],
  manaValue:[''],
};

export type FilterUpdate = {
  property:keyof Selected,
  value:string,
  index?:number, // If there is no index, it's treated as an append
                 // If the value is an empty string, the selection is deleted.
}
export type FilterUpdateFunction = (...updates:FilterUpdate[])=>void;
export type FilterChangeFunction<T> = (value:string, index:number)=>void;

const useFilters = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);

  const updateSelected:FilterUpdateFunction = useCallback((...updates) => {
    console.log('updates', updates);
    
    setSelected((prev) => {
      const newSelected = { ...prev };
      updates.forEach(({ property, value, index }) => {
        const arr = [...newSelected[property]];

        if (index !== undefined) {
          if (value === '')
            arr.splice(index, 1);
          else
            arr[index] = value;
        } else {
          if (value === '') return;

          arr.push(value);
        }

        if (arr.length === 0) arr.push('');
        else if (arr[arr.length - 1] !== '') arr.push('');

        newSelected[property] = arr;
      });
      console.log('newSelected', newSelected);
      return newSelected;
    });
  }, []);

  const makeHandler = useCallback((property:SKey):FilterChangeFunction<HTMLInputElement | HTMLSelectElement> => {
    return (value, index) => {
      updateSelected({ property, value, index });
    };
  }, [updateSelected]);

  const handlers = useMemo(() => {
    const entries:[SKey, FilterChangeFunction<HTMLInputElement | HTMLSelectElement>][] =
      (Object.keys(defaultSelected) as SKey[]).map((key) => [
        key,
        makeHandler(key),
      ]);
    return Object.fromEntries(entries) as Record<SKey, FilterChangeFunction<HTMLInputElement | HTMLSelectElement>>;
  }, [makeHandler]);

  return {selected, updateSelected, handlers};
};

export default useFilters;