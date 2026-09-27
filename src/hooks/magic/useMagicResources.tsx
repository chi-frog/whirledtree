/*
* A hook for pulling magic data from Scryfall, local storage,
* or other sources.
*/
'use client'

import { useMemo, useState } from "react";
import { MagicFormat, MagicSet } from "@/components/magic/types/default";
import useMagicSymbols from "./useMagicSymbols";
import useMagicTypes from "./useMagicTypes";
import { fetchImage } from "@/components/general/ImageRepoProvider";
import useMagicSets from "./useMagicSets";
import { WError } from "@/components/magic/types/werror";
import { MagicSymbol } from "@/components/magic/types/magic";

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
  sets:MagicSet[],
  types:string[],
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
  const [formats, setFormats] = useState<MagicFormat[]>([]);
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

  return {errorMap, loadMap, sets, types, symbols, symbolImageMap };
};

export default useMagicResources;