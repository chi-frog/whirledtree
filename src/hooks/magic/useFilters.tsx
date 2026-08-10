'use client'

import { GAME_TYPE } from "@/components/magic/types/magic";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";

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
  name:[],
  format:[],
  set:[],
  type:[],
  power:[],
  toughness:[],
  oracleText:[],
  manaValue:[]
}

export type FilterUpdate = {
  property:keyof Selected,
  value:string[],
}
export type FilterUpdateFunction = (...updates:FilterUpdate[])=>void;

const useFilters = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);

  const updateSelected: FilterUpdateFunction = useCallback((...updates) => {
    console.log('updates', updates);
    
    setSelected((prev) => {
      const newSelected = { ...prev };
      updates.forEach(({ property, value }) => {
        newSelected[property] = value;
      });
      return newSelected;
    });
  }, []);

  const makeHandler = useCallback((property: SKey): ChangeEventHandler<HTMLInputElement | HTMLSelectElement> => {
    return (e) => {
      updateSelected({ property, value: [e.target.value] });
    };
  }, [updateSelected]);

  const handlers = useMemo(() => {
    const entries: [SKey, ChangeEventHandler<HTMLInputElement | HTMLSelectElement>][] = (Object.keys(defaultSelected) as SKey[]).map((key) => [
      key,
      makeHandler(key),
    ]);
    return Object.fromEntries(entries) as Record<SKey, ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>;
  }, [makeHandler]);

  return {selected, updateSelected, handlers};
};

export default useFilters;