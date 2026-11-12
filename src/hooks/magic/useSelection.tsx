'use client'

import { GAME_TYPE } from "@/components/magic/types/magic";
import { useCallback, useMemo, useState } from "react";

export const maxSections = 5;
export const AND = 'and';
export const OR = 'or';

/*
* Operator defines a math operation:
* =, <, <=, >, >=
*/
enum OPERATOR {
  EQUALS='=',
  GREATER='>',
  LESSER='<',
  GREATEREQUALS='>=',
  LESSEREQUALS='<=',
};
type Operator = OPERATOR;

export type SelectedSection = {
  value:string,
  polarity:boolean,
  connector:'and'|'or',
  operator?:Operator,
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
  power:[{value:'', polarity:true, connector:AND, operator:OPERATOR.EQUALS}],
  toughness:[{value:'', polarity:true, connector:AND, operator:OPERATOR.EQUALS}],
  oracleText:[{value:'', polarity:true, connector:AND}],
  manaValue:[{value:'', polarity:true, connector:AND}],
};

export type SelectionUpdate = {
  property: keyof Selected,
  value?: string,
  polarity?:boolean,
  connector?:'and'|'or',
  operator?:Operator,
  index?: number, // If there is no index, it's treated as an append
                  // If the value is an empty string, the selection is deleted.
};
export type SelectionUpdateFunction = (...updates:SelectionUpdate[])=>void;
export type SelectionChangeFunction = (section:Partial<SelectedSection>, index:number)=>void;

const useSelection = () => {
  const [selected, setSelected] = useState<Selected>(defaultSelected);

  const updateSelected:SelectionUpdateFunction = useCallback((...updates) => {
    setSelected((prev) => {
      const newSelected = { ...prev };

      updates.forEach(({ property, value, polarity, connector, operator, index }) => {
        const arr = [...newSelected[property]];
        index = (index) ?? (arr.length - 1);

        if (value === '')
          arr.splice(index, 1);
        else {
          arr[index] = {
            ...arr[index],
            ...(value !== undefined && { value }),
            ...(polarity !== undefined && { polarity }),
            ...(connector !== undefined && { connector }),
            ...(operator !== undefined && { operator }),
          };
        }

        if ((arr.length === 0) ||
            (arr[arr.length - 1].value !== ''))
          arr.push(defaultSelected[property][0]);

        newSelected[property] = arr;
      });

      return newSelected;
    });
  }, []);

  const makeHandler = useCallback((property:SKey):SelectionChangeFunction => {
    return ({value, polarity, connector}, index) => {
      updateSelected({ property, value, polarity, connector, index });
    };
  }, [updateSelected]);

  const handlers = useMemo(() => {
    const entries:[SKey, SelectionChangeFunction][] =
      (Object.keys(defaultSelected) as SKey[]).map((key) => [
        key,
        makeHandler(key),
      ]);
    return Object.fromEntries(entries) as Record<SKey, SelectionChangeFunction>;
  }, [makeHandler]);

  return {selected, updateSelected, handlers};
};

export default useSelection;