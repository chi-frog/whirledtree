/*
* A hook for pulling magic data from Scryfall, local storage,
* or other sources.
*/
'use client'

import { useMemo, useState } from "react";
import useMagicCards, { ImageMap } from "./useMagicCards";
import useMagicSets from "./useMagicSets";
import { MagicCard, MagicFormat, MagicSet } from "@/components/magic/types/default";
import { capitalize } from "@/helpers/string";
import { _noError, _notFound, WError } from "@/components/magic/CardDisplay";
import { copyMap } from "@/helpers/wmap";

/*
* Everything listed here has both a loaded/unloaded state,
* and corresponding error(s).
*/
type DataKeys = {
  'formats':string,
  'sets':string,
  'cards':string,
  'images':string,
};
export type ErrorMap = Map<keyof DataKeys, WError[]>;
const _errorMap:ErrorMap = new Map([
  ['formats', []],
  ['sets', []],
  ['cards', []],
  ['images', []],
])
export type LoadMap = Map<keyof DataKeys, boolean>;
const _loadMap:LoadMap = new Map([
  ['formats', false],
  ['sets', false],
  ['cards', false],
  ['images', false]
])
export type MagicDatabase = {
  errorMap:ErrorMap,
  loadMap:LoadMap,
  formats:MagicFormat[],
  sets:MagicSet[],
  cards:MagicCard[],
  imageMap:ImageMap,
  hydrateLargeImage:(index:number)=>void,
}
type Return = MagicDatabase;
type UseMagicData = (
  url:string,
) => Return;
const useMagicDatabase:UseMagicData = (url) => {
  //const [symbols, setSymbols] = useMagicSymbols();
  const [formats, setFormats] = useState<MagicFormat[]>([]);
  const [setsError, setsLoaded, sets] = useMagicSets();
  const [cardsError, cardsLoaded, imagesLoaded, cards, imageMap, hydrateLargeImage] = useMagicCards(url);
  const [loadMap, setLoadMap] = useState<LoadMap>(_loadMap)
  const [errorMap, setErrorMap] = useState<ErrorMap>(_errorMap);

  useMemo(() => {
    if ((cards.length > 0) && (formats.length === 0))
      setFormats([{name:"Any"},
        ...Object.getOwnPropertyNames(cards[0].legalities).map((_format) => ({name:capitalize(_format)}))]);
  }, [cards]);

  useMemo(() => {
    if (formats.length !== 0) 
      setLoadMap(copyMap(loadMap.set('formats', true)));
    else {
      const formatsErrors = errorMap.get('formats');
      if (!formatsErrors) return;
      setErrorMap(copyMap(
        errorMap).set('formats', formatsErrors?.concat(_notFound('formats'))));
    }
  }, [formats]);

  useMemo(() => {
    if (setsLoaded)
      setLoadMap(copyMap(loadMap.set('sets', true)));
    else {
      const setsErrors = errorMap.get('sets');
      if (!setsErrors) return;
      setErrorMap(copyMap(
        errorMap).set('sets', setsErrors?.concat(setsError)));
    }
  }, [setsError, setsLoaded]);

  useMemo(() => {
    if (cardsLoaded)
      setLoadMap(copyMap(loadMap.set('cards', true)));
    else {
      const cardsErrors = errorMap.get('cards');
      if (!cardsErrors) return;
      setErrorMap(copyMap(
        errorMap).set('cards', cardsErrors.concat(cardsError)));
    }
  }, [cardsError, cardsLoaded]);

  useMemo(() => {
    if (cardsLoaded && imagesLoaded)
      setLoadMap(copyMap(loadMap.set('images', true)));
    else {
      const imagesErrors = errorMap.get('images');
      if (!imagesErrors) return;
      setErrorMap(copyMap(
        errorMap).set('images', imagesErrors.concat(cardsError)));
    }
  }, [cards, imagesLoaded]);

  return {errorMap, loadMap, formats, sets, cards, imageMap, hydrateLargeImage};
};

export default useMagicDatabase;