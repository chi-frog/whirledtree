'use client'

import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";
import { ChangeEventHandler, useState } from "react";

export const ANY = 'any';

type Selected = {
  name:string,
  format:string,
  set:string, //acronym
}
type SKey = keyof Selected;

const defaultSelected = {
  name:'',
  format:ANY,
  set:'aer',
}

export type FilterUpdate = {
  property:keyof Selected,
  value:string,
}

const useFilters = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);
  const url = constructSearchUrl(selected.set, selected.format, selected.name);

  const updateSelected = (...updates:FilterUpdate[]) => {
    let newSelected = {...selected};

    updates.forEach((_update) => {
      newSelected[_update.property] = _update.value;
    });

    setSelected(newSelected);
  };

  type MakeHandler = (property:SKey)=>ChangeEventHandler<HTMLInputElement|HTMLSelectElement>;
  const makeHandler:MakeHandler = (property) =>
    (e) => {updateSelected({property, value:e.target.value})};

  const handlers = Object.fromEntries(
    (Object.keys(defaultSelected) as SKey[]).map((key) => [
      key,
      makeHandler(key),
    ])) as Record<SKey, ChangeEventHandler<HTMLInputElement>>;

  return {url, selected, updateSelected, handlers};
};

export default useFilters;