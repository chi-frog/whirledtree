'use client'

import { MagicSymbol } from "@/components/magic/types/magic";
import useExternalData, { Transform } from "../useExternalData";
import { WError } from "@/components/magic/types/werror";

const transformMagicSymbol:Transform<MagicSymbol> = (data:any) => ({
  imageUri:data.svg_uri,
  symbol:data.symbol,
});

type UseMagicSymbols = () => [
  error:WError,
  loaded:boolean,
  symbols:MagicSymbol[],
];
const useMagicSymbols:UseMagicSymbols = () => {
  const [error, loaded, symbols] = useExternalData(
    'https://api.scryfall.com/symbology',
    transformMagicSymbol,
  );
  
  return [error, loaded, symbols];
};

export default useMagicSymbols;