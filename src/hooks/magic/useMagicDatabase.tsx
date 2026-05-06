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

type LoadMap = Map<string, boolean>;
const _loadMap = new Map([
  ['formats', false],
  ['sets', false],
  ['cards', false],
  ['images', false]
])
type Return = [
  errors:WError[],
  loadMap:LoadMap,
  formats:MagicFormat[],
  sets:MagicSet[],
  cards:MagicCard[],
  imageMap:ImageMap,
  hydrateLargeImage:(index:number)=>void,
];
type UseMagicData = (
  url:string,
) => Return;
const useMagicDatabase:UseMagicData = (url) => {
  const [formats, setFormats] = useState<MagicFormat[]>([]);
  const [setsError, setsLoaded, sets] = useMagicSets();
  const [cardsError, cardsLoaded, imagesLoaded, cards, imageMap, hydrateLargeImage] = useMagicCards(url);
  const [loadMap, setLoadMap] = useState<LoadMap>(_loadMap)
  const [errors, setErrors] = useState<WError[]>([_noError]);

  useMemo(() => {
    if ((cards.length > 0) && (formats.length === 0))
      setFormats([{name:"Any"},
        ...Object.getOwnPropertyNames(cards[0].legalities).map((_format) => ({name:capitalize(_format)}))]);
  }, [cards]);

  useMemo(() => {
    if (formats.length !== 0) 
      setLoadMap(loadMap.set('formats', true));
    else
      setErrors(errors.concat(_notFound('formats')));
  }, [formats]);

  useMemo(() => {
    if (setsLoaded)
      setLoadMap(loadMap.set('sets', true));
    else
      setErrors(errors.concat(setsError));
  }, [setsError, setsLoaded]);

  useMemo(() => {
    if (cardsLoaded)
      setLoadMap(loadMap.set('cards', true));
    else
      setErrors(errors.concat(cardsError));
  }, [cardsError, cardsLoaded]);

  useMemo(() => {
    if (imagesLoaded)
      setLoadMap(loadMap.set('images', true));
    else
      setErrors(errors.concat(cardsError));
  }, [cards, imagesLoaded]);

  return [errors, loadMap, formats, sets, cards, imageMap, hydrateLargeImage];
};

export default useMagicDatabase;