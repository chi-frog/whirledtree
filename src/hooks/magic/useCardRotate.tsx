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
type ForceRotate = (angle:number)=>void;
type UseCardRotateReturn = [
  cardRotateState:CardRotateState,
  startRotatingCard:StartRotatingCard,
  forceRotate:ForceRotate
];
type UseCardRotate = (
  dims:{x:number, y:number, width:number, height:number},
  dir:number, // +1 = left to right, -1 = right to left
  subDrag:SubDrag,
  startDragging:StartDragging,
  dragStateRef:RefObject<DragState>,
) => UseCardRotateReturn;
const useCardRotate:UseCardRotate = (
    dims,
    dir,
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
      let state = {...ref.current};
      let terminate = (state.angle <= 0 && state.angle > -5) ||
                      (state.angle > 0 && state.angle < 5);

      state.angle = (terminate) ? 0 : state.angle - 5 * Math.sign(state.angle);

      if (!terminate)
        raf = requestAnimationFrame(returnTick);
      else
        state.stage = DragStage.INACTIVE;

      ref.current = state;
      setState(ref.current);
    }
  
    const rotateTick = () => {
      // I don't mind overloading the name 'state'
      // since I shouldn't be using it for calc anyway
      let state = {
        ...ref.current,
        ...dragStateRef.current,
      };

      if (state.stage === DragStage.INACTIVE) {
        state.stage = DragStage.RETURNING;
        ref.current = state;
        setState(ref.current);
        return raf = requestAnimationFrame(returnTick);

      } else if (dir > 0) {
        let normalizedXDistance = state.point.x - state.start.x;
          
        if (normalizedXDistance < 0)
          normalizedXDistance = 0;
        else if (normalizedXDistance > (dims.width - state.start.x + dims.x))
          normalizedXDistance = (dims.width - state.start.x + dims.x);   
          
        const ratio = normalizedXDistance /
                      (dims.width - state.start.x + dims.x);
        state.angle = ratio * 180;
      } else {
        let normalizedXDistance = state.point.x - state.start.x;

        if (normalizedXDistance > 0)
          normalizedXDistance = 0;
        else if ((dir < 0) && (normalizedXDistance < (-1*(dims.width - (dims.width + dims.x - state.start.x)))))
          normalizedXDistance = -1*(dims.width - (dims.width + dims.x - state.start.x));
        const ratio = normalizedXDistance /
                      (dims.width - (dims.width + dims.x - state.start.x));

        state.angle = -1 * ratio * 180;
      }
      
      ref.current = state;
      setState(ref.current);
  
      raf = requestAnimationFrame(rotateTick);
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
      ...dragState};
    setState(ref.current);
  };

  const forceRotate = (angle:number) => {
    ref.current = {
      ...ref.current,
      angle:angle};
    setState(ref.current);
  }

  return [
    state,
    startRotatingCard,
    forceRotate,
  ];
};

export default useCardRotate;