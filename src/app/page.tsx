'use client'

import JournalWriter from "@/components/journalWriter/JournalWriter";
import { Search } from "@/components/magic/Search";
import Focus from "@/components/test/Focus";
import { createContext, MouseEventHandler, useContext, useState } from "react";

export type ScrollStartFunc = (e:React.MouseEvent<Element>)=>void;
export type ScrollFunc = (e:React.MouseEvent<Element>)=>void;
export type ScrollSubscription = {
  tag:any,
  onScrollStart:ScrollStartFunc,
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

export default function Home() {
  const testing:string|null = null;
  const [scrolling , setScrolling] = useState<boolean>(false);
  const [scrollSubscriptions, setScrollSubscriptions] = useState<ScrollSubscription[]>([]);

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

  const handleMouseScroll:MouseEventHandler = (e) => {
    
  }

  return (
    <div className="flex min-h-screen flex-col justify-between"
      onMouseDown={handleMouseScroll}
      onMouseMoveCapture={handleMouseMove}
      onMouseUp={handleMouseUp}>
      <ScrollContext value={{subScroll, scrollOn, scrolling}}>
      {!testing && <Search />}
      {testing && <JournalWriter />}
      {testing === 'focus' && <Focus />}
      </ScrollContext>
    </div>
  );
}
