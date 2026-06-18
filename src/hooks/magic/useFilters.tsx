'use client'

import { ChangeEventHandler, useCallback, useMemo, useState } from "react";

export const ANY = 'Any';

export type Selected = {
  name:string,
  format:string,
  set:string, //acronym
}
type SKey = keyof Selected;

const defaultSelected = {
  name:'',
  format:ANY,
  set:ANY,
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