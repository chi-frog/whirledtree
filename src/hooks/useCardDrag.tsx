'use client';

import { DragStage, DragState, StartDragging, SubDrag, _dragState } from "@/components/general/DragProvider";
import { copyMap } from "@/helpers/wmap";
import { WPoint, makeWPoint, _wpoint, addWPoints, fsubWPoints, caddWPoints, divWPoint } from "@/helpers/wpoint";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";

const tag = 'card';

export type CardDragMap = Map<number, CardDragState>;
export interface CardDragState extends DragState {
  resistance: WPoint;
  returnSpeed: number;
  weight: number;
  angle: WPoint; /* 0-maxAngle */
  maxAngle: number;
}
export const _cardDragState:CardDragState = {
  ..._dragState,
  resistance:makeWPoint({x:5, y:5}),
  returnSpeed:50,
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
  const [index, setIndex] = useState<number>(-1);
  const cardDragMapRef = useRef<CardDragMap>(new Map<number, CardDragState>());
  const [cardDragMap, setCardDragMap] = useState<CardDragMap>(new Map<number, CardDragState>());

  const dragging = useMemo(() => index !== -1, [index]);

  useEffect(() => {
    subDrag({tag})
  }, []);

  const drag = () => {
    let raf:number;

    const returnTick = () => {
      const cardMapEntry = cardDragMapRef.current.get(index);
      if (!cardMapEntry) return;

      let state = {...cardMapEntry};

      const start = state.start;
      const point = state.point;
  
      const dx = start.x - point.x
      const dy = start.y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      let nextPoint;
    
      if (distance < state.returnSpeed) {
        nextPoint = start;
        state.stage = DragStage.INACTIVE;
        console.log('terminated!');
  
      } else {
        const angle = Math.atan2(dy, dx);
            
        const force = {
          x: Math.cos(angle) * state.returnSpeed,
          y: Math.sin(angle) * state.returnSpeed,
        };
  
        nextPoint = addWPoints(point, force);
      }
        
      state.point = nextPoint;

      cardDragMapRef.current.set(index, {...state});
      setCardDragMap(copyMap(cardDragMapRef.current));
    }

    const dragTick = () => {
      let contextState = dragStateRef.current;
      let refState = cardDragMapRef.current.get(index);
      if (!refState) return;
      let state = {
        ...refState,
        ...contextState
      };

      const terminate = (state.stage === DragStage.INACTIVE);

      if (terminate) state.stage = DragStage.RETURNING;
      else {
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
      }
      
      cardDragMapRef.current.set(index, {...state});
      setCardDragMap(copyMap(cardDragMapRef.current));

      raf = (!terminate) ? requestAnimationFrame(dragTick) :
                           requestAnimationFrame(returnTick);
    };

    if (dragging)
      raf = requestAnimationFrame(dragTick);
    return () => {

    };
  }

  useEffect(() => {
    if (dragging) 
      drag()
  
  }, [dragging]);

  const startDraggingCard:StartDraggingCard = (e, index) => {
    const dragState = startDragging(e, tag);
    setIndex(index);
    cardDragMapRef.current.set(index, {
      ..._cardDragState,
      ...dragState,
      });
    setCardDragMap(copyMap(cardDragMapRef.current));
  };

  const stopDraggingCard:StopDraggingCard = (e) => {
    const cardState = cardDragMapRef.current.get(index);

    if (cardState) {
      cardState.stage = DragStage.RETURNING;
      setCardDragMap(copyMap(cardDragMapRef.current));
    }

    setIndex(-1);
  };

  return [
    index,
    cardDragMap,
    startDraggingCard,
    stopDraggingCard,
  ];
};

export default useCardDrag;