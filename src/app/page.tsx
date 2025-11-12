'use client'

import JournalWriter from "@/components/journalWriter/JournalWriter";
import Focus from "@/components/test/Focus";
import { createContext, MouseEventHandler, useContext, useState } from "react";

type TaggedFunction = {
  tag:string,
  func:Function,
}

type SuperEventHandler = {
  name:string,
  funcs:TaggedFunction[],
};

type SuperEventContext = {
  subMouseMove:(tag:string, func:Function)=>void,
}

const SuperEventContext = createContext<SuperEventContext|undefined>(undefined);

export const useSuperEventContext = () => {
  const ctx = useContext(SuperEventContext);

  if (ctx === undefined)
    throw new Error("useSystemFontContext not available");

  return ctx;
}

export default function Home() {
  const testing:string|null = null;
  const [handlers, setHandlers] = useState<SuperEventHandler[]>([
    {name:'onMouseMove', funcs:[]}
  ]);

  const superEventContext:SuperEventContext = {
    subMouseMove:(tag, func)=> {
      setHandlers((_handlers) =>
        _handlers.map((_handler) =>
          (_handler.name === 'onMouseMove' &&
           !_handler.funcs.find((_func) => _func.tag === tag)) ?
            {..._handler, funcs:_handler.funcs.concat({tag, func})} :
            _handler))
    },
  }

  const handleMouseMove:MouseEventHandler = (e) => {
    console.log('mouseMove SUPERVISOR (' + e.clientX + "," + e.clientY + ")");
  
    handlers.find((_handler) => _handler.name === 'onMouseMove')?.funcs.forEach((_func) =>
      _func.func());
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between"
      onMouseMoveCapture={handleMouseMove}>
      <SuperEventContext value={superEventContext}>
      {!testing && <JournalWriter />}
      {testing === 'focus' && <Focus />}
      </SuperEventContext>
    </div>
  );
}
