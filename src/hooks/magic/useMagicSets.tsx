'use client'

import { _magicSetAny, MagicSet } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { WError } from "@/components/magic/SearchResults";

const scryfallUrl = 'https://api.scryfall.com/';
const urlSets = 'sets/';

const transformMagicSet:Transform<MagicSet> = (input) => ({
  name:input.name,
  acronym:input.code,
  type:input.set_type,
});

type Return = [
  error:WError,
  loaded:boolean,
  sets:MagicSet[],
]
const useMagicSets:()=>Return = () => {
  const [error, loaded, sets] = useExternalData<MagicSet>(
    scryfallUrl + urlSets,
    transformMagicSet);
  
  return [error, loaded, [_magicSetAny, ...sets]]};

export default useMagicSets;