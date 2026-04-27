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
  returnSpeed:20,
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

  const onDragCardEnd = (e:PointerEvent) => {
    //At this point, dragStateRef contains the final point of the drag,
    //not the default value after having been zero'd out.
    let cardDragState = cardDragMapRef.current.get(index);
  
    if (!cardDragState) {
      console.log('something wrong');
      return;
    }
    cardDragMapRef.current.set(index, {
      ...cardDragState,
      ...dragStateRef.current
    })
    setCardDragMap(copyMap(cardDragMapRef.current));
    setIndex(-1);
  };

  useEffect(() => {
    subDrag({tag,
             onDragEnd:onDragCardEnd})
  }, []);

  useEffect(() => {
    // No card selected, so we aren't dragging a card around.
    if (!dragging) return;
  
    let raf: number;
  
    const tick = () => {
      let state = dragStateRef.current;
      let cardState = cardDragMapRef.current.get(index);
      console.log('hh', cardDragMapRef.current);
      if (!cardState) {
        console.log('oh god why');
        return;
      }
  
      console.log('HERE BOY', cardDragMap.keys().toArray());
  
      const onReturn = () => {
        const start = cardState.start;
        const point = cardState.point;
  
        const dx = start.x - point.x
        const dy = start.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let nextPoint;
  
        console.log('point' + cardState.point.x + "," + cardState.point.y + 'origin' + cardState.start.x + "," + cardState.start.y  );
  
        if (distance < cardState.returnSpeed) {
          nextPoint = start;
          cardState.stage = DragStage.INACTIVE;
          console.log('terminated!');
  
        } else {
          const angle = Math.atan2(dy, dx);
            
          const force = {
            x: Math.cos(angle) * cardState.returnSpeed,
            y: Math.sin(angle) * cardState.returnSpeed,
          };
  
          nextPoint = addWPoints(point, force);
        }
        
        cardState.point = nextPoint;
      }
  
      if (cardState.stage === DragStage.RETURNING)
        onReturn();
  
      let nextAngle =
        (state.delta.x === 0 && state.delta.y === 0) ?
            fsubWPoints(cardState.angle,
                        cardState.resistance) :
            fsubWPoints(caddWPoints(cardState.angle,
                                    divWPoint(state.delta,
                                              cardState.weight),
                                    cardState.maxAngle),
                        cardState.resistance);
        
      dragStateRef.current.delta = _wpoint;

      console.log('cs', cardState);
  
      const terminate = (cardState.stage === DragStage.INACTIVE);
      if (terminate)
        cardDragMapRef.current.delete(index);
      else if (cardState.stage === DragStage.RETURNING)
        cardDragMapRef.current.set(index, {
          ...cardState,
          angle: nextAngle,
        });
      else
        cardDragMapRef.current.set(index, {
          ...cardState,
          ...state,
          angle: nextAngle,
        });
      setCardDragMap(copyMap(cardDragMapRef.current));
  
      if (!terminate)
        raf = requestAnimationFrame(tick);
    };
  
    if (dragging)
      raf = requestAnimationFrame(tick);
    return () => {
      //cancelAnimationFrame(raf);
    }
  }, [dragging]);

  const startDraggingCard:StartDraggingCard = (e, index) => {
    const dragState = startDragging(e, tag);
    console.log('tag', tag);
    setIndex(index);
    cardDragMapRef.current.set(index, {
      ..._cardDragState,
      ...dragState,
      });
    setCardDragMap(copyMap(cardDragMapRef.current));
    console.log('start!', cardDragMapRef.current.get(index));
  };

  const stopDraggingCard:StopDraggingCard = (e) => {
    const cardState = cardDragMapRef.current.get(index);

    if (cardState) {
      cardState.stage = DragStage.RETURNING;
      setCardDragMap(copyMap(cardDragMapRef.current));
    }
  };

  return [
    index,
    cardDragMap,
    startDraggingCard,
    stopDraggingCard,
  ];
};

export default useCardDrag;