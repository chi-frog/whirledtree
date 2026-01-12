'use client'

import JournalWriter from "@/components/journalWriter/JournalWriter";
import {SearchResults} from "@/components/magic/SearchResults";
import Focus from "@/components/test/Focus";
import { _wpoint, makeWPoint, subWPoints, WPoint } from "@/helpers/wpoint";
import { createContext, useContext, useEffect, useRef } from "react";

export type DragFunc = (e:PointerEvent)=>void;
export type DragSubscription = {
  tag:any,
  onDragStart?:DragFunc,
  onDrag?:DragFunc,
  onDragEnd?:DragFunc,
};
export type SubDrag = ({tag, onDragStart, onDrag, onDragEnd}:DragSubscription)=>void;
export type StartDragging = (e:PointerEvent|React.PointerEvent, tag:string)=>void;
type Drag = {
  subDrag:SubDrag,
  startDragging:StartDragging,
  dragStartPointRef:React.RefObject<WPoint>,
  dragStateRef:React.RefObject<DragState>,
};
export type DragState = {
  point:WPoint,
  delta:WPoint,
  moved:boolean,
}
export const _dragState = {
  point:_wpoint,
  delta:_wpoint,
  moved:false,
}

const DragContext = createContext<Drag|undefined>(undefined);

export const useDragContext = () => {
  const ctx = useContext(DragContext);

  if (ctx === undefined)
    throw new Error("useDragContext not available");

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
  const dragTarget = useRef<string>("");
  const dragStartPoint = useRef<WPoint>(_wpoint);
  const dragState = useRef<DragState>(_dragState);
  const dragSubscriptions = useRef<DragSubscription[]>([]);
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

  const handleWindowPointerMove = (e:PointerEvent) => {
    drag(e);
  }

  const handleWindowPointerUp = (e:PointerEvent) => {
    stopDragging(e);
  }

  useEffect(() => {
    window.addEventListener('pointermove', handleWindowPointerMove, {capture:true});
    window.addEventListener('pointerup', handleWindowPointerUp, {capture:true});

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    }
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

  const subDrag:SubDrag = ({tag, onDragStart, onDrag, onDragEnd}) => {
    if ((!tag))
      return;

    const dragSubscription = dragSubscriptions.current.find((_ss) => _ss.tag === tag);

    if (dragSubscription)
      dragSubscriptions.current = dragSubscriptions.current.filter((_ss) => _ss.tag !== tag).concat({tag, onDragStart, onDrag, onDragEnd});
    else
      dragSubscriptions.current = dragSubscriptions.current.concat({tag, onDragStart, onDrag, onDragEnd});
  };

  const runStartFuncs = (e:PointerEvent, tag:string) =>
    dragSubscriptions.current.filter((_ss) => _ss.tag === tag)
      .forEach((_ss) => (_ss.onDragStart) &&
      _ss.onDragStart(e));

  const runFuncs = (e:PointerEvent, tag:string) =>
    dragSubscriptions.current.filter((_ss) => _ss.tag === tag)
      .forEach((_ss) => (_ss.onDrag) &&
      _ss.onDrag(e));

  const runEndFuncs = (e:PointerEvent, tag:string) =>
    dragSubscriptions.current.filter((_ss) => _ss.tag === tag)
      .forEach((_ss) => (_ss.onDragEnd) &&
      _ss.onDragEnd(e));

  const startDragging = (e:PointerEvent|React.PointerEvent, tag:string) => {
    const nativeEvent =
      "nativeEvent" in e ? e.nativeEvent : e;
    
    dragTarget.current = tag;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
    dragStartPoint.current = dragState.current.point = makeWPoint(nativeEvent);
    dragState.current.delta = _wpoint;
    runStartFuncs(nativeEvent, tag);
  };

  const drag = (e:PointerEvent) => {
    if (dragTarget.current === "") 
      return;
    const point = makeWPoint(e);
    dragState.current = {
      point,
      delta:subWPoints(point, dragState.current.point),
      moved:true,
    }
    runFuncs(e, dragTarget.current);
  };

  const stopDragging = (e:PointerEvent) => {
    if (dragTarget.current !== '')
      runEndFuncs(e, dragTarget.current);

    requestAnimationFrame(() => {
      document.body.style.cursor = "";
    });
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragTarget.current = "";
  }

  //      {testing && <JournalWriter />}


  return (
    <div className="flex min-h-screen flex-col justify-between">
      <DragContext value={{subDrag, startDragging, dragStartPointRef:dragStartPoint, dragStateRef:dragState}}>
      <SelectionContext value={{subSelection}}>
      {!testing && <SearchResults />}
      {testing === 'focus' && <Focus />}
      </SelectionContext>
      </DragContext>
    </div>
  );
}
