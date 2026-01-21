'use client'

import { DragProvider } from "@/components/general/DragContext";
import { SelectionProvider } from "@/components/general/SelectionProvider";
import JournalWriter from "@/components/journalWriter/JournalWriter";
import {SearchResults} from "@/components/magic/SearchResults";
import Focus from "@/components/test/Focus";
import { _wpoint } from "@/helpers/wpoint";
import { createContext, useContext } from "react";

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

  //      {testing && <JournalWriter />}

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <DragProvider>
      <SelectionProvider>
      {!testing && <SearchResults />}
      {testing === 'focus' && <Focus />}
      </SelectionProvider>
      </DragProvider>
    </div>
  );
}
