'use client';

import { DragStage, DragState, StartDragging, SubDrag, _dragState } from "@/components/general/DragProvider";
import { WPoint, makeWPoint, _wpoint, addWPoints, fsubWPoints, caddWPoints, divWPoint, subWPoints, divWPoints, mulWPoint, mulWPoints } from "@/helpers/wpoint";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";

const tag = 'cardRotate';

export interface CardRotateState extends DragState {
  resistance: WPoint;
  returnSpeed: number;
  weight: number;
  angle: number; 
  maxAngle: number;
}
export const _cardRotateState:CardRotateState = {
  ..._dragState,
  resistance:makeWPoint({x:5, y:5}),
  returnSpeed:20,
  weight:4,
  angle:0,
  maxAngle:80,
}

type StartRotatingCard = (e:PointerEvent|React.PointerEvent)=>void;
type UseCardRotateReturn = [
  cardRotateState:CardRotateState,
  startRotatingCard:StartRotatingCard,
];
type UseCardRotate = (
  dims:{x:number, y:number, width:number, height:number},
  subDrag:SubDrag,
  startDragging:StartDragging,
  dragStateRef:RefObject<DragState>,
) => UseCardRotateReturn;
const useCardRotate:UseCardRotate = (
    dims,
    subDrag,
    startDragging,
    dragStateRef
  ) => {
  const ref = useRef<CardRotateState>(_cardRotateState);
  const [state, setState] = useState<CardRotateState>(ref.current);

  const rotating = useMemo(() => state.stage === DragStage.ACTIVE, [state.stage]);
  const returning = useMemo(() => state.stage === DragStage.RETURNING, [state.stage]);

  useEffect(() => {
    subDrag({tag})
  }, []);

  useEffect(() => {
    if (rotating)
      rotate();
    
  }, [rotating]);

  const rotate = () => {
    let raf: number;

    const returnTick = () => {
      let state = {
        ...ref.current,
      }

      state.angle = (state.angle <= 1) ? 0 : state.angle - 5;

      console.log('returnTick!', state.angle);

      ref.current = state;
      setState(ref.current);

      if (state.angle !== 0)
        raf = requestAnimationFrame(returnTick);
    }
  
    const rotateTick = () => {
      // I don't mind overloading the name 'state'
      // since I shouldn't be using it for calc anyway
      let state = {
        ...ref.current,
        ...dragStateRef.current,
      }
      console.table(state);

      const terminate = (state.stage === DragStage.INACTIVE);

      if (terminate) state.stage = DragStage.RETURNING;
      else {
        const normalizedXDistance = state.point.x - state.start.x;
        const ratio = normalizedXDistance /
                      (dims.width - (state.start.x - dims.x));

        state.angle = ratio * 2 * 90;
      }
      
      console.log('terminate?', terminate);
      console.log('ang', state.angle);
      ref.current = state;
      setState(ref.current);
  
      raf = (!terminate) ? requestAnimationFrame(rotateTick) :
                           requestAnimationFrame(returnTick);
    };
    
    if (rotating)
      raf = requestAnimationFrame(rotateTick);
    return () => {
      //cancelAnimationFrame(raf);
    }
  }

  const startRotatingCard:StartRotatingCard = (e) => {
    const dragState = startDragging(e, tag);
    ref.current = {
      ...ref.current,
      ...dragState
    }
    setState(ref.current)
  };

  return [
    state,
    startRotatingCard,
  ];
};

export default useCardRotate;