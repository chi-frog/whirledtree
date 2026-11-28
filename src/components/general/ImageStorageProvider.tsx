'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useRef } from "react";

type ImageStorageMap = Map<string, HTMLImageElement>
type ImageSignalMap = Map<string, Dispatch<SetStateAction<boolean>>>
type ImageStorage = {
  getImage:(src:string)=>HTMLImageElement|undefined,
  storeImage:(src:string, img:HTMLImageElement)=>void,
  hasImage:(src?:string)=>boolean,
  addSignal:(src?:string, signal?:Dispatch<SetStateAction<boolean>>)=>void,
}
const ImageStorageContext = createContext<ImageStorage|undefined>(undefined);

export const useImageStorageContext = () => {
  const ctx = useContext(ImageStorageContext);

  if (ctx === undefined)
    throw new Error("useImageStorageContext not available");

  return ctx;
}

type Props = {
  children:ReactNode
};
export const ImageStorageProvider = ({children}:Props) => {
  const map = useRef<ImageStorageMap>(new Map<string, HTMLImageElement>());
  const signalMap = useRef<ImageSignalMap>(new Map<string, Dispatch<SetStateAction<boolean>>>())

  const getImage = useCallback((src:string) => {
    return map.current.get(src);
  }, []);

  const storeImage = useCallback((src:string, img:HTMLImageElement) => {
    if (!img) return;

    map.current.set(src, img)
    if (signalMap.current.has(src))
      signalMap.current.get(src)?.(true);
  }, []);

  const hasImage = useCallback((src:string='') => map.current.get(src) !== undefined, []);

  const addSignal = useCallback((src?:string, signal?:Dispatch<SetStateAction<boolean>>) => {
    if (!src || !signal) return;

    signalMap.current.set(src, signal);
  }, []);

  return (
    <ImageStorageContext.Provider value={{
        getImage,
        storeImage,
        hasImage,
        addSignal,
      }}>
      {children}
    </ImageStorageContext.Provider>
  )
};