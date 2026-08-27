'use client'

import { createImageMap, createImagePacket, ImageMap, ImagePacket, ImageSize } from "@/hooks/magic/useMagicCards";
import { createContext, ReactNode, useCallback, useContext, useRef } from "react";
import { MagicCard } from "../magic/types/default";

type ImageRepository = {
  addImage:(card:MagicCard, url:string, side:keyof ImagePacket, size:ImageSize)=>void,
  getImagePacket:(card:MagicCard)=>ImagePacket|undefined,
}
const ImageRepositoryContext = createContext<ImageRepository|undefined>(undefined);

export const useImageRepositoryContext = () => {
  const ctx = useContext(ImageRepositoryContext);

  if (ctx === undefined)
    throw new Error("useImageRepositoryContext not available");

  return ctx;
}

type Props = {
  children:ReactNode
};
export const ImageRepoProvider = ({children}:Props) => {
  const imageMap = useRef<ImageMap>(createImageMap());

  const addImage = useCallback((card:MagicCard, url:string, side:keyof ImagePacket, size:ImageSize) => {
    let oracleIdMap = imageMap.current.get(card.oracleId);
    let imagePacket = oracleIdMap?.get(card.id);

    if (!oracleIdMap) {
      oracleIdMap = new Map<string, ImagePacket>();
      imageMap.current.set(card.oracleId, oracleIdMap);
    }
    if (!imagePacket)
      imagePacket = createImagePacket();

    imagePacket[side][size] = url;
    oracleIdMap.set(card.id, imagePacket);
  }, []);

  const getImagePacket = useCallback((card:MagicCard) => {
    if (!card) return undefined;

    return imageMap.current.get(card.oracleId)?.get(card.id);
  }, []);

  return (
    <ImageRepositoryContext.Provider value={{
      addImage,
      getImagePacket,
    }}>
      {children}
    </ImageRepositoryContext.Provider>
  )
};