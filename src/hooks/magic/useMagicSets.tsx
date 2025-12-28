'use client'

import { MagicSet } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";

const scryfallUrl = 'https://api.scryfall.com/';
const urlSets = 'sets/';

const transformMagicSet:Transform<MagicSet> = (input) => ({
  name:input.name,
  acronym:input.code,
  type:input.set_type,
});

const useMagicSets = () => {
  
  return useExternalData<MagicSet>(
    scryfallUrl + urlSets,
    transformMagicSet)}

export default useMagicSets;