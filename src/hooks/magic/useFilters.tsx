'use client'

import { GAME_TYPE } from "@/components/magic/types/magic";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";

export const ANY = '';

export type Selected = {
  game:string,
  name?:string,
  format?:string,
  set?:string, //acronym
  type?:string,
}
export type SKey = keyof Selected;

const defaultSelected = {
  game:GAME_TYPE.PAPER,
  name:ANY,
  format:ANY,
  set:ANY,
  type:ANY,
}

export type FilterUpdate = {
  property:keyof Selected,
  value:string,
}
export type FilterUpdateFunction = (...updates:FilterUpdate[])=>void;

const useFilters = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);

  const updateSelected: FilterUpdateFunction = useCallback((...updates) => {
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
      updateSelected({ property, value: e.target.value });
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