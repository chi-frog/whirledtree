'use client'

import { useEffect, useState } from "react";
import useExternalData, { Transform } from "../useExternalData";
import { WError } from "@/components/magic/CardDisplay";

type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };
export type ImageMap = Map<string, ImagePacket>;

export type MagicSymbol = {
  imageUri:string,
  symbol:string,
}

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
  const [imageMap, setImageMap] = useState<ImageMap>(new Map());
  const [error, loaded, symbols] = useExternalData(
    'https://api.scryfall.com/symbology',
    transformMagicSymbol,
  );
  
  return [error, loaded, symbols];
};

export default useMagicSymbols;