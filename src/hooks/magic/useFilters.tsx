'use client'

import { GAME_TYPE } from "@/components/magic/types/magic";
import { useCallback, useMemo, useState } from "react";

export const maxSections = 5;
export const AND = 'and';
export const OR = 'or';

export type SelectedSection = {
  value:string,
  polarity:boolean,
  connector:'and'|'or',
}
export type Selected = {
  game:SelectedSection[],
  name:SelectedSection[],
  format:SelectedSection[],
  set:SelectedSection[], //acronym
  type:SelectedSection[],
  power:SelectedSection[],
  toughness:SelectedSection[],
  oracleText:SelectedSection[],
  manaValue:SelectedSection[],
}
export type SKey = keyof Selected;

export const defaultSelected:Selected = {
  game:[{value:GAME_TYPE.PAPER, polarity:true, connector:AND},
        {value:'', polarity:true, connector:AND}],
  name:[{value:'', polarity:true, connector:AND}],
  format:[{value:'', polarity:true, connector:AND}],
  set:[{value:'', polarity:true, connector:AND}],
  type:[{value:'', polarity:true, connector:AND}],
  power:[{value:'', polarity:true, connector:AND}],
  toughness:[{value:'', polarity:true, connector:AND}],
  oracleText:[{value:'', polarity:true, connector:AND}],
  manaValue:[{value:'', polarity:true, connector:AND}],
};

export type FilterUpdate = {
  property: keyof Selected,
  value?: string,
  polarity?:boolean,
  connector?:'and'|'or',
  index?: number, // If there is no index, it's treated as an append
                  // If the value is an empty string, the selection is deleted.
};
export type FilterUpdateFunction = (...updates:FilterUpdate[])=>void;
export type FilterChangeFunction = (section:Partial<SelectedSection>, index:number)=>void;

const useFilters = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);

  const updateSelected:FilterUpdateFunction = useCallback((...updates) => {
    console.log('updates', updates);
    
    setSelected((prev) => {
      const newSelected = { ...prev };

      updates.forEach(({ property, value, polarity, connector, index }) => {
        const arr = [...newSelected[property]];

        if (index !== undefined) {
          if (value === '')
            arr.splice(index, 1);
          else {
            arr[index] = {
              ...arr[index],
              ...(value !== undefined && { value }),
              ...(polarity !== undefined && { polarity }),
              ...(connector !== undefined && { connector }),
            };
          }
        } else {
          if (value === '') return;

          arr.push({
            value:(value) ?? '',
            polarity:(polarity) ?? true,
            connector:(connector) ?? AND,
          });
        }

        if ((arr.length === 0) ||
            (arr[arr.length - 1].value !== ''))
          arr.push({value:'', polarity:true, connector:AND});

        newSelected[property] = arr;
      });


      console.log('newSelected', newSelected);

      return newSelected;
    });
  }, []);

  const makeHandler = useCallback((property:SKey):FilterChangeFunction => {
    return ({value, polarity, connector}, index) => {
      updateSelected({ property, value, polarity, connector, index });
    };
  }, [updateSelected]);

  const handlers = useMemo(() => {
    const entries:[SKey, FilterChangeFunction][] =
      (Object.keys(defaultSelected) as SKey[]).map((key) => [
        key,
        makeHandler(key),
      ]);
    return Object.fromEntries(entries) as Record<SKey, FilterChangeFunction>;
  }, [makeHandler]);

  return {selected, updateSelected, handlers};
};

export default useFilters;