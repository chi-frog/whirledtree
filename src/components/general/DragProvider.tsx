'use client';

import { WPoint, _wpoint, makeWPoint, subWPoints } from "@/helpers/wpoint";
import { ReactNode, useContext, useEffect, useRef } from "react";
import { createContext } from "react";

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
  dragStateRef:React.RefObject<DragState>,
};
export enum DragStage {
  INACTIVE='inactive',
  ACTIVE='active',
}
export type DragState = {
  stage:DragStage,
  point:WPoint,
  start:WPoint,
  delta:WPoint,
  moved:boolean,
}
export const _dragState = {
  stage:DragStage.INACTIVE,
  point:_wpoint,
  start:_wpoint,
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

export const DragProvider = ({ children }: { children: ReactNode }) => {
  const dragTarget = useRef<string>("");
  const dragState = useRef<DragState>(_dragState);
  const dragSubscriptions = useRef<DragSubscription[]>([]);

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
    dragState.current.stage = DragStage.ACTIVE;
    dragState.current.start = dragState.current.point = makeWPoint(nativeEvent);
    dragState.current.delta = _wpoint;
    runStartFuncs(nativeEvent, tag);
  };
  
  const drag = (e:PointerEvent) => {
    if (dragTarget.current === "") 
      return;
    const point = makeWPoint(e);
    dragState.current = {
      ...dragState.current,
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
    dragState.current.start = _wpoint;
    dragState.current.point = _wpoint;
    dragState.current.stage = DragStage.INACTIVE;
    dragTarget.current = "";
  }

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
    
  return (
    <DragContext.Provider value={{
        subDrag,
        startDragging,
        dragStateRef:dragState
        }}>
      {children}
    </DragContext.Provider>
  );
}