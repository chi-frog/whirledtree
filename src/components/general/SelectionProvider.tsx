'use client';

import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

export type SelectionChangeFunc = (selection:Selection)=>void;
export type SelectionSubscription = {
  tag:string,
  onSelectionChange:SelectionChangeFunc,
};
export type SubSelection = ({tag, onSelectionChange}:SelectionSubscription)=>void;
type WSelection = {
  subSelection:SubSelection,
}

const SelectionContext = createContext<WSelection|undefined>(undefined);

export const useSelectionContext = () => {
  const ctx = useContext(SelectionContext);

  if (ctx === undefined)
    throw new Error("useSelectionContext not available");

  return ctx;
}

export const SelectionProvider = ({ children }: {children:ReactNode}) => {
  const selectionSubscriptions = useRef<SelectionSubscription[]>([]);

  const handleSelectionChange = (e:Event) => {
    const selection = window.getSelection();
    if (!selection) return;

    selectionSubscriptions.current.forEach((_ss) => _ss.onSelectionChange(selection));
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const subSelection:SubSelection = ({tag, onSelectionChange}) => {
    if ((!tag))
      return;

    const selectionSubscription = selectionSubscriptions.current.find((_ss) => _ss.tag === tag);

    if (selectionSubscription) {
      selectionSubscriptions.current = selectionSubscriptions.current.filter((_ss) => _ss.tag !== tag).concat({tag, onSelectionChange}); 
    } else {
      selectionSubscriptions.current = selectionSubscriptions.current.concat({tag, onSelectionChange});
    }
  };

  return (
    <SelectionContext.Provider value={{
        subSelection
      }}>
      {children}
    </SelectionContext.Provider>
  )
};