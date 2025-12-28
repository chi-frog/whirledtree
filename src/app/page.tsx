'use client'

import JournalWriter from "@/components/journalWriter/JournalWriter";
import {SearchResults} from "@/components/magic/SearchResults";
import Focus from "@/components/test/Focus";
import { createContext, MouseEventHandler, useContext, useEffect, useRef, useState } from "react";

export type ScrollFunc = (e:React.MouseEvent<Element>)=>void;
export type ScrollSubscription = {
  tag:any,
  onScrollStart:ScrollFunc,
  onScroll:ScrollFunc,
  onScrollEnd:ScrollFunc,
};
export type SubScroll = ({tag, onScroll, onScrollEnd}:ScrollSubscription)=>void;
export type ScrollOn = (e:React.MouseEvent<Element>)=>void;
type Scroll = {
  subScroll:SubScroll,
  scrollOn:ScrollOn,
  scrolling:boolean,
};

const ScrollContext = createContext<Scroll|undefined>(undefined);

export const useScrollContext = () => {
  const ctx = useContext(ScrollContext);

  if (ctx === undefined)
    throw new Error("useScrollContext not available");

  return ctx;
}

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
  const [scrolling , setScrolling] = useState<boolean>(false);
  const [scrollSubscriptions, setScrollSubscriptions] = useState<ScrollSubscription[]>([]);
  const selectionSubscriptions = useRef<SelectionSubscription[]>([]);

  const handleSelectionChange = (e:Event) => {
    console.log('selectionchange', e);

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

  const subScroll:SubScroll = ({tag, onScrollStart, onScroll, onScrollEnd}) => {
    if ((!tag))
      return;

    const scrollSubscription = scrollSubscriptions.find((_ss) => _ss.tag === tag);

    if (scrollSubscription)
      setScrollSubscriptions(scrollSubscriptions.filter((_ss) => _ss.tag !== tag).concat({tag, onScrollStart, onScroll, onScrollEnd}));
    else
      setScrollSubscriptions(scrollSubscriptions.concat({tag, onScrollStart, onScroll, onScrollEnd}));
  };

  const runStartFuncs = (e:React.MouseEvent<Element>) =>
    scrollSubscriptions.forEach((_ss) => _ss.onScrollStart(e));

  const runFuncs = (e:React.MouseEvent<Element>) =>
    scrollSubscriptions.forEach((_ss) => _ss.onScroll(e));

  const runEndFuncs = (e:React.MouseEvent<Element>) =>
    scrollSubscriptions.forEach((_ss) => _ss.onScrollEnd(e));

  const scrollOn = (e:React.MouseEvent<Element>) => {
    setScrolling(true);
    runStartFuncs(e);
  };

  const handleMouseMove:MouseEventHandler = (e) => {
    if(scrolling) runFuncs(e);
  }

  const handleMouseUp:MouseEventHandler = (e) => {
    if (scrolling) {
      runEndFuncs(e);
      setScrolling(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between"
      onMouseMoveCapture={handleMouseMove}
      onMouseUp={handleMouseUp}>
      <ScrollContext value={{subScroll, scrollOn, scrolling}}>
      <SelectionContext value={{subSelection}}>
      {!testing && <SearchResults />}
      {testing && <JournalWriter />}
      {testing === 'focus' && <Focus />}
      </SelectionContext>
      </ScrollContext>
    </div>
  );
}
