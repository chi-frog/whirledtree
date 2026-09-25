'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useRef } from "react";
import { MagicCard } from "../magic/types/default";
import { copyFace, copyImageMap, copyPrint, copyPrintMap, Face, ImageMap, initImageMap, initPrint, initPrintMap, Print, PrintMap, PrintSide, PrintSize } from "../magic/types/imageRepo";

export const fetchImage = async (
  uri: string
): Promise<string|undefined> => {
  try {
    const response = await fetch(uri);
    if (!response.ok) return "";

    const blob = await response.blob();

    return URL.createObjectURL(blob);

  } catch(err) {
    console.error('fetchImageFailed:', err);
    return "";
  }
};

export const hydrateImageMap = async (imageMap:ImageMap, setImageMap:Dispatch<SetStateAction<ImageMap>>, cards:MagicCard[], size:'small'|'large') => {
  const hydrateCard = async (uris:string[]) => 
    await Promise.all(uris.map(async (_uri, _index) =>
      (_uri === "") ? "" : await fetchImage(_uri)))
  
  await Promise.all(cards.map(async (_card, _index) => {
    let oracleId = _card.oracleId;
    let printId = _card.id;

    const cardImages = imageMap.get(oracleId)?.get(printId);
    let frontUri = _card.imageUris[size];
    let backUri = (_card.back) ? _card.back.imageUris[size] : "";

    if (cardImages) {
      if (cardImages.front[size])
        frontUri = "";
      if (cardImages.back[size])
        backUri = "";
    }

    if (frontUri === "" && backUri === "")
      return;

    const imageUrls = await hydrateCard([frontUri, backUri]);
      /*
    setImageMap((prev) => {
      const imageMap = copyImageMap(prev);
      let printsMap = imageMap.get(oracleId);
      if (!printsMap)
        printsMap = new Map<string, Print>();

      const existing = printsMap.get(printId);
      const imagePacket = (existing) ?
        {...existing} :
        initPrint();

      imagePacket.front[size] = {imageUrls[0] ?? '';
      imagePacket.back[blobKey[size]] = imageUrls[1];

      printsMap.set(printId, imagePacket);
      imageMap.set(oracleId, printsMap);

      return imageMap;
    });*/
  }));
};

export const hydrateImage = async (imageMap:ImageMap, setImageMap:Dispatch<SetStateAction<ImageMap>>, card:MagicCard, size:'small'|'large') => {
  hydrateImageMap(imageMap, setImageMap, [card], size);
};

type ImageRepository = {
  addImage:(oracleId:string, id:string, side:PrintSide, size:PrintSize, url:string)=>void,
  getPrint:(oracleId:string, id:string)=>Print|undefined,
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
  const map = useRef<ImageMap>(initImageMap());

  const addImage = useCallback((oracleId:string, id:string, side:PrintSide, size:PrintSize, url:string) => {
    // Get all of the different printings for a given oracle id
    let printMap:PrintMap|undefined = map.current.get(oracleId);
    printMap = (!printMap) ? initPrintMap() : copyPrintMap(printMap);

    // Get this specific printing
    let print:Print|undefined = printMap.get(id);
    print = (!print) ? initPrint() : copyPrint(print);

    let face:Face = copyFace(print[side]);

    face[size] = url;
    print[side] = face;

    console.log('Adding url:' + url + ' to card ' + oracleId + ',' + id + ' on side ' + side + ' with size ' + size);

    printMap.set(id, print);
    map.current.set(oracleId, printMap);
  }, []);

  const getPrint = useCallback((oracleId:string, id:string) => {
    let printMap:PrintMap|undefined = map.current.get(oracleId);
    if (!printMap) return undefined;

    let print:Print|undefined = printMap.get(id);
    
    return print;
  }, []);

  return (
    <ImageRepositoryContext.Provider value={{
      addImage,
      getPrint,
      }}>
      {children}
    </ImageRepositoryContext.Provider>
  )
};