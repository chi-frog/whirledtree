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

type StartDraggingCard = (e:PointerEvent|React.PointerEvent, index:number)=>void;
type StopDraggingCard = (e:PointerEvent|React.PointerEvent)=>void;
type UseCardDragReturn = [
  draggingCard:number,
  cardDragMap:CardDragMap,
  startDraggingCard:StartDraggingCard,
  stopDraggingCard:StopDraggingCard,
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
  const indexRef = useRef<number>(-1);
  const cardDragMapRef = useRef<CardDragMap>(new Map<number, CardDragState>());
  const [cardDragMap, setCardDragMap] = useState<CardDragMap>(new Map<number, CardDragState>());

  const onDragEnd = () => {
    const index = indexRef.current;
    const cardState = cardDragMapRef.current.get(index);

    if (cardState) {
      cardState.stage = DragStage.RETURNING;
      cardState.returnStartPoint = cardState.point;
      cardState.returnStartAngle = cardState.angle;
      cardDragMapRef.current.set(index, {...cardState});
      setCardDragMap(copyMap(cardDragMapRef.current));
    }

    indexRef.current = -1;
    setDragging(false);
  }

  useEffect(() => {
    subDrag({tag, onDragEnd})
  }, []);

  const drag = (index:number) => {
    let raf:number;

    const returnTick = () => {
      const cardMapEntry = cardDragMapRef.current.get(index);
      if (!cardMapEntry) return;

      let state = { ...cardMapEntry };

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
        cardDragMapRef.current.delete(index);
        setCardDragMap(copyMap(cardDragMapRef.current));
        return;
      }

      cardDragMapRef.current.set(index, state);
      setCardDragMap(copyMap(cardDragMapRef.current));

      if (state.stage == DragStage.RETURNING)
        raf = requestAnimationFrame(returnTick);
    };

    const dragTick = () => {
      let contextState = dragStateRef.current;
      let refState = cardDragMapRef.current.get(index);
      if (!refState) return;
      let state = {
        ...refState,
        ...contextState
      };

      if (state.stage === DragStage.RETURNING)
        return raf = requestAnimationFrame(returnTick);

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
      
      cardDragMapRef.current.set(index, {...state});
      setCardDragMap(copyMap(cardDragMapRef.current));

      raf = requestAnimationFrame(dragTick);
    };

    raf = requestAnimationFrame(dragTick);

    return () => {

    };
  }

  useEffect(() => {
    if (dragging) 
      drag(indexRef.current);
  
  }, [dragging]);

  const startDraggingCard:StartDraggingCard = (e, index) => {
    const dragState = startDragging(e, tag);
    indexRef.current = index;
    cardDragMapRef.current.set(index, {
      ..._cardDragState,
      ...dragState,
      });
    setCardDragMap(copyMap(cardDragMapRef.current));
    setDragging(true);
  };

  const stopDraggingCard:StopDraggingCard = (e) => {
    /*const cardState = cardDragMapRef.current.get(index);

    if (cardState) {
      cardState.stage = DragStage.RETURNING;
      cardState.returnStartPoint = cardState.point;
      cardState.returnStartAngle = cardState.angle;
      cardDragMapRef.current.set(index, {
      ...cardState,
      });
      setCardDragMap(copyMap(cardDragMapRef.current));
    }

    setIndex(-1);*/
  };

  return [
    indexRef.current,
    cardDragMap,
    startDraggingCard,
    stopDraggingCard,
  ];
};

export default useCardDrag;