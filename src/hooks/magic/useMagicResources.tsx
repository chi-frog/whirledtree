/*
* A hook for pulling magic data from Scryfall, local storage,
* or other sources.
*/
'use client'

import { useMemo, useState } from "react";
import { MagicSet } from "@/components/magic/types/default";
import useMagicSymbols from "./useMagicSymbols";
import useMagicTypes from "./useMagicTypes";
import { fetchImage } from "@/components/general/ImageRepoProvider";
import useMagicSets from "./useMagicSets";
import { WError } from "@/components/magic/types/werror";
import { MagicFormat, MagicSymbol, MagicType } from "@/components/magic/types/magic";

/*
* Everything listed here has both a loaded/unloaded state,
* and corresponding error(s).
*/
type DataKeys = {
  'formats':string,
  'sets':string,
  'types':string,
};
export type ErrorMap = Map<keyof DataKeys, WError[]>;
const _errorMap:ErrorMap = new Map([
  ['formats', []],
  ['sets', []],
  ['types', []],
])
export type LoadMap = Map<keyof DataKeys, boolean>;
const _loadMap:LoadMap = new Map([
  ['formats', false],
  ['sets', false],
  ['types', false],
])
export type MagicResources = {
  errorMap:ErrorMap,
  loadMap:LoadMap,
  formats:MagicFormat[],
  sets:MagicSet[],
  types:MagicType[],
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
}
type Return = MagicResources;
type UseMagicData = (
) => Return;
const useMagicResources:UseMagicData = () => {
  const [setsError, setsLoaded, sets] = useMagicSets();
  const [typesError, typesLoaded, types] = useMagicTypes();
  const [symbolsError, symbolsLoaded, symbols] = useMagicSymbols();
  const [symbolImageMap, setSymbolImageMap] = useState<Map<string, string>>(new Map<string, string>());
  const [formats, setFormats] = useState<MagicFormat[]>([
    {name:'Standard', acronym:'standard'},
    {name:'Future Standard', acronym:'future'},
    {name:'Historic', acronym:'historic'},
    {name:'Timeless', acronym:'timeless'},
    {name:'Gladiator', acronym:'gladiator'},
    {name:'Pioneer', acronym:'pioneer'},
    {name:'Modern', acronym:'modern'},
    {name:'Legacy', acronym:'legacy'},
    {name:'Pauper', acronym:'pauper'},
    {name:'Vintage', acronym:'vintage'},
    {name:'Penny Dreadful', acronym: 'penny'},
    {name:'Commander', acronym:'commander'},
    {name:'Oathbreaker', acronym:'oathbreaker'},
    {name:'Standard Brawl', acronym:'standardbrawl'},
    {name:'Brawl', acronym:'brawl'},
    {name:'Competitive Brawl', acronym:'competitivebrawl'},
    {name:'Alchemy', acronym:'alchemy'},
    {name:'Pauper Commander', acronym:'paupercommander'},
    {name:'Duel Commander', acronym:'duel'},
    {name:'Old School 93/94', acronym:'oldschool'},
    {name:'Pre-Modern', acronym:'premodern'},
    {name:'Pre-Edh', acronym:'predh'},
    {name:'Tiny Leaders: Reborn', acronym:'tlr'},
  ]);
  const [loadMap, setLoadMap] = useState<LoadMap>(_loadMap)
  const [errorMap, setErrorMap] = useState<ErrorMap>(_errorMap);

  useMemo(() => {
    if (!symbolsLoaded) return;

    symbols.forEach(async (_symbol) => {
      const url = await fetchImage(_symbol.imageUri);
      if (!url) return;

      setSymbolImageMap((prev) => {
        const updated = new Map<string, string>();
        for (const [key, value] of prev)
          updated.set(key, value);
        updated.set(_symbol.symbol, url);

        return updated;
      });
    });
  }, [symbolsLoaded]);

  return {errorMap, loadMap, formats, sets, types, symbols, symbolImageMap };
};

export default useMagicResources;