'use client';

import { DragStage, DragState, StartDragging, SubDrag, _dragState } from "@/components/general/DragProvider";
import { copyMap } from "@/helpers/wmap";
import { WPoint, makeWPoint, _wpoint, addWPoints, fsubWPoints, caddWPoints, divWPoint, mulWPoint, subWPoints } from "@/helpers/wpoint";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";

const tag = 'card';

export type CardDragMap = Map<number, CardDragState>;
export interface CardDragState extends DragState {
  resistance: WPoint;
  returnDuration:number;
  returnStartTime:number;
  returnStartAngle:WPoint;
  returnStartPoint:WPoint;
  weight: number;
  angle: WPoint; /* 0-maxAngle */
  maxAngle: number;
}
export const _cardDragState:CardDragState = {
  ..._dragState,
  resistance:makeWPoint({x:5, y:5}),
  returnDuration:300,
  returnStartTime:-1,
  returnStartAngle:_wpoint,
  returnStartPoint:_wpoint,
  weight:4,
  angle:_wpoint,
  maxAngle:80,
}

type StartDraggingCard = (e:PointerEvent|React.PointerEvent)=>void;
type UseCardDragReturn = [
  dragState:CardDragState,
  startDraggingCard:StartDraggingCard,
];
type UseCardDrag = (
  subDrag:SubDrag,
  startDragging:StartDragging,
  dragStateRef:RefObject<DragState>,
) => UseCardDragReturn;
const useCardDrag:UseCardDrag = (
    subDrag,
    startDragging,
    dragStateRef
  ) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const cardDragStateRef = useRef<CardDragState>(_cardDragState);
  const [dragState, setDragState] = useState<CardDragState>(cardDragStateRef.current);

  useEffect(() => {
    console.log('HEREE', dragging);
    document.body.classList.toggle("no-select", dragging);
  }, [dragging]);
  

  useEffect(() => {
    subDrag({tag})
  }, []);

  const drag = () => {
    let raf:number;

    const returnTick = () => {
      let state = {...cardDragStateRef.current};

      if (state.returnStartTime < 0) state.returnStartTime = Date.now();

      const now = Date.now();
      const elapsed = now - state.returnStartTime;
      const timeRatio = Math.min(elapsed / state.returnDuration, 1);
      const eased = 1 - Math.pow(1 - timeRatio, 3);
      const diff = subWPoints(state.start, state.returnStartPoint);

      state.point = addWPoints(state.returnStartPoint, mulWPoint(diff, eased));
      state.angle = mulWPoint(state.returnStartAngle, 1 - eased);

      if (timeRatio >= 1) {
        state = _cardDragState;
        cardDragStateRef.current = state;
        setDragState(state);
        return;
      }

      cardDragStateRef.current = state;
      setDragState(state);

      if (state.stage == DragStage.RETURNING)
        raf = requestAnimationFrame(returnTick);
    };

    const dragTick = () => {
      let contextState = dragStateRef.current;
      let refState = cardDragStateRef.current;
      if (!refState) return;
      let state = {
        ...refState,
        ...contextState
      };

      if (state.stage === DragStage.INACTIVE) {
        state.stage = DragStage.RETURNING;
        state.returnStartPoint = state.point;
        state.returnStartAngle = state.angle;

        cardDragStateRef.current = state;
        setDragState(state);
        setDragging(false);

        return raf = requestAnimationFrame(returnTick);
      }

      contextState.delta = _wpoint;

      let angle =
        (state.delta.x === 0 && state.delta.y === 0) ?
          fsubWPoints(state.angle,
                      state.resistance) :
          fsubWPoints(caddWPoints(state.angle,
                                  divWPoint(state.delta,
                                            state.weight),
                                  state.maxAngle),
                      state.resistance);
        
      state.angle = angle;
      
      cardDragStateRef.current = state;
      setDragState(state);

      raf = requestAnimationFrame(dragTick);
    };

    raf = requestAnimationFrame(dragTick);

    return () => {

    };
  }

  useEffect(() => {
    if (dragging) 
      drag();
  
  }, [dragging]);

  const startDraggingCard:StartDraggingCard = (e) => {
    const dragState = startDragging(e, tag);
    console.log('starting');
    console.table(dragState)
    cardDragStateRef.current = {
      ..._cardDragState,
      ...dragState,
      };
      console.table(cardDragStateRef.current);
    setDragState(cardDragStateRef.current)
    setDragging(true);
  };

  return [
    dragState,
    startDraggingCard,
  ];
};

export default useCardDrag;