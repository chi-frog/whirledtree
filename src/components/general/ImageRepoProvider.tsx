'use client'

import { createContext, ReactNode, useCallback, useContext, useRef } from "react";
import { copyFace,  copyPrint, copyPrintMap, Face, ImageMap, initImageMap, initPrint, initPrintMap, Print, PrintMap, PrintSide, PrintSize } from "../magic/types/imageRepo";

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