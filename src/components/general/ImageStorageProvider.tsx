'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useRef } from "react";

type ImageStorageMap = Map<string, HTMLImageElement>
type ImageSignalMap = Map<string, Dispatch<SetStateAction<boolean>>>
type ImageStorage = {
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

  const storeImage = useCallback((src:string, img:HTMLImageElement) => {
    if (!img) return;

    map.current.set(src, img)
    if (signalMap.current.has(src)) {
      console.log(src + " - Calling the signal!")
      signalMap.current.get(src)?.(true);
    } else {
      console.log(src + " - Didn't find the signal");
    }
  }, []);

  const hasImage = useCallback((src:string='') => map.current.get(src) !== undefined, []);

  const addSignal = useCallback((src?:string, signal?:Dispatch<SetStateAction<boolean>>) => {
    if (!src || !signal) return;

    signalMap.current.set(src, signal);
    console.log(src + " - Added the signal")
  }, []);

  return (
    <ImageStorageContext.Provider value={{
      storeImage,
      hasImage,
      addSignal,
      }}>
      {children}
    </ImageStorageContext.Provider>
  )
};