'use client'

import { DragProvider } from "@/components/general/DragContext";
import JournalWriter from "@/components/journalWriter/JournalWriter";
import {SearchResults} from "@/components/magic/SearchResults";
import Focus from "@/components/test/Focus";
import { _wpoint, makeWPoint, subWPoints, WPoint } from "@/helpers/wpoint";
import { createContext, useContext, useEffect, useRef } from "react";

export type SelectionChangeFunc = (selection:Selection)=>void;
export type SelectionSubscription = {
  tag:string,
  onSelectionChange:SelectionChangeFunc,
};
export type SubSelection = ({tag, onSelectionChange}:SelectionSubscription)=>void;
type SelectionWT = {
  subSelection:SubSelection,
}

const SelectionContext = createContext<SelectionWT|undefined>(undefined);

export const useSelectionContext = () => {
  const ctx = useContext(SelectionContext);

  if (ctx === undefined)
    throw new Error("useSelectionContext not available");

  return ctx;
}

export default function Home() {
  const testing:string|null = null;
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

  //      {testing && <JournalWriter />}

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <DragProvider>
      <SelectionContext value={{subSelection}}>
      {!testing && <SearchResults />}
      {testing === 'focus' && <Focus />}
      </SelectionContext>
      </DragProvider>
    </div>
  );
}
