'use client'

import { _wpoint, areEqualWPoints, WPoint } from "@/helpers/wpoint";
import { isCardDoublesided, MagicCard } from "./types/default";
import { ImagePacket } from "./CardDisplay";
import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragStage, useDragContext } from "../general/DragProvider";
import useCardRotate from "@/hooks/magic/useCardRotate";
import useCardDrag from "@/hooks/useCardDrag";

export type CardLocation =
  'view' | 'modal';
type Props = {
  location:CardLocation,
  widthString:string,
  heightString?:string,
  imageHeightString?:string,
  card:MagicCard,
  changeCard:(card:MagicCard)=>void,
  imagePackets:ImagePacket[],
  handlePointerUp?:(e:React.PointerEvent, x:number, y:number) => void,
};
export const Card:React.FC<Props> = ({
    location,
    widthString,
    heightString,
    imageHeightString,
    card,
    changeCard,
    imagePackets,
    handlePointerUp,
  }:Props) => {
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dims, setDims] = useState({ x:0, y:0, width: 0, height: 0 });
  const [mousedover, setMousedover] = useState<boolean>(false);
  const [rotateState, startRotating, forceRotate] =
    useCardRotate(dims, (card.reversed) ? -1 : 1, subDrag, startDragging, dragStateRef);
  const ref = useRef<null|HTMLDivElement>(null);
  const raf = useRef<number>(-1);
  const lastMousePress = useRef<WPoint>(_wpoint);
  const [dragState, startDraggingCard] = useCardDrag(subDrag, startDragging, dragStateRef);

  const flipping = useMemo(() => rotateState.angle > 90, [rotateState.angle]);
  const showFront = useMemo(() =>
    ((!card.reversed && rotateState.angle <= 90) ||
     (card.reversed && rotateState.angle > 90)), [card.reversed, rotateState.angle]);

  useEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const {x, y} = entry.target.getBoundingClientRect();
          setDims({
            x: x,
            y: y,
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });

      observer.observe(ref.current);

      // Cleanup function
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const imageSrc = useMemo(() =>
    (!card || imagePackets.length <= 0)    ? undefined :
    (imagePackets[0].largeBlob)            ? imagePackets[0].largeBlob :
                                             imagePackets[0].smallBlob
  , [imagePackets]);

  const backImageSrc = useMemo(() =>
    ((!card) ||
     (imagePackets.length <= 1) ||
     (!isCardDoublesided(card))) ? undefined :
    (imagePackets[1].largeBlob)                   ? imagePackets[1].largeBlob :
                                                    imagePackets[1].smallBlob
    , [imagePackets, card.layout]);

  const x = useMemo(() => 
    (dragState) ? (dragState.point.x - dragState.start.x) : 0, [dragState]);
  const y = useMemo(() =>
    (dragState) ? (dragState.point.y - dragState.start.y) : 0, [dragState]);
  const angle = useMemo(() =>
    (dragState) ? (dragState.angle) : 0, [dragState]);
  const dragging = useMemo(() =>
    (dragState) ? (dragState.stage === DragStage.ACTIVE) : 0, [dragState?.stage]);

  const glow = useCallback((version:boolean) => {
    const element = ref.current;
    if (!element) return;

    cancelAnimationFrame(raf.current);

    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;
    element.style.border = "1px solid rgb(146, 148, 248)";
    element.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging && (location === 'view'))
      element.style.top = "-3px";

    const change = () => {
      if (element.style.boxShadow === 'none') {
        cancelAnimationFrame(raf.current);
        return;
      }

      if(opacityGoingUp) {
        opacity += (opacityFirstPass) ? opacityRate*15 : opacityRate;
        if (opacity >= 1) {
          opacityGoingUp = false;
          opacityFirstPass = false;
        }
      } else {
        opacity -= opacityRate;
        if (opacity <= 0.7)
          opacityGoingUp = true;
      }

      const selectedBoxShadow = `0px 0px 15px 10px rgba(146, 255, 248, ${opacity})`;
      const mouseoverBoxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;

      element.style.boxShadow = (version) ?
        selectedBoxShadow:
        mouseoverBoxShadow;

      raf.current = requestAnimationFrame(change);
    };

    raf.current = requestAnimationFrame(change);

    return () => cancelAnimationFrame(raf.current);
  }, []);

  const handleCardPointerEnter = (e:React.PointerEvent) => {
    glow(false);
    setMousedover(true);
  };

  const handleCardPointerLeave = (e:React.PointerEvent) => {
    const element = ref.current;
    if (!element) return;

    element.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    element.style.boxShadow = "none";
    element.style.position = "auto";
    element.style.top = "";

    setMousedover(false);
  };

  const handleCardPointerDown = (e:React.PointerEvent) => {
    e.stopPropagation();
    startDraggingCard(e);
    glow(true);
    console.log('card', card);
  }

  const handleCardPointerUp = (e:React.PointerEvent) => {
    if (handlePointerUp)
      handlePointerUp(e, lastMousePress.current.x, lastMousePress.current.y);
    glow(false);
  }

  //{...(getRef && { ref: getRef.bind(null, index) })}

  const tlaRatios = (dims:{width:number, height:number}) => {
    const circleSize = 55;
    const imgWidth = 670;
    const imgHeight = 935;
    const sizeRatio = circleSize/imgWidth;
    const topRatio = 46/imgHeight;
    const leftRatio = 39/imgWidth;

    return {
      x:dims.width*leftRatio,
      y:dims.height*topRatio,
      w:dims.width*sizeRatio,
      h:dims.width*sizeRatio,
    };
  }

  const khmRatios = (dims:{width:number, height:number}) => {
    const circleSize = 50;
    const imgWidth = 670;
    const imgHeight = 935;
    const sizeRatio = circleSize/imgWidth;
    const topRatio = 44/imgHeight;
    const leftRatio = 34.5/imgWidth;

    return {
      x:dims.width*leftRatio,
      y:dims.height*topRatio,
      w:dims.width*sizeRatio,
      h:dims.width*sizeRatio,
    };
  }

  const doubleSidedCircleOffset:{x:number, y:number, w:number, h:number} = useMemo(() => {
    const def = {x:0, y:0, w:0, h:0};
    
    if (isCardDoublesided(card)) {
      if (!ref.current) return def;

      return (card.set === 'tla') ? tlaRatios(dims) :
             (card.set === 'khm') ? khmRatios(dims) :
                                    tlaRatios(dims);
    }
    return def;
  }, [dims]);

  const handleDoublesidedPointerDown:PointerEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startRotating(e);
    lastMousePress.current = {x:e.clientX, y:e.clientY};
  };

  const handleDoublesidedPointerUp:PointerEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const point = {x:e.clientX, y:e.clientY};

    if ((areEqualWPoints(point, lastMousePress.current)) ||
        (rotateState.angle > 90)) {
        changeCard({...card, reversed:!card.reversed})
      if (flipping)
        forceRotate(90 - (rotateState.angle - 90));
    }
  };

  return (
    <div
      ref={ref}
      onPointerEnter={(e)=>handleCardPointerEnter(e)}
      onPointerLeave={(e)=>handleCardPointerLeave(e)}
      onPointerDown={(e) => handleCardPointerDown(e)}
      onPointerUp={(e) => handleCardPointerUp(e)} style={{
        display:'flex',
        cursor:'hand',
        flexDirection:'column',
        margin:(location === 'view') ? '5px' : '0px',
        overflow:'hidden',
        borderRadius:(location ==='view') ? '12px' : '20px',
        border:'1px solid rgba(255, 255, 255, 0.7)',
        minWidth:'fit-content',
        transform:
          (dragState && dragState.stage !== DragStage.INACTIVE) ?
            `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          (rotateState.stage !== DragStage.INACTIVE) ?
          (!flipping) ?
            `rotate3d(0, 1, 0, ${rotateState.angle}deg)` :
            `rotate3d(0, 1, 0, ${90 - (rotateState.angle - 90)}deg)` :
            '',
        width:widthString,
        height:heightString,
        position: 'relative',
        zIndex: (dragState.stage !== DragStage.INACTIVE) ? 30 : 0,
        }}>
      <img src={imageSrc} draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        cursor:'pointer',
        marginTop:'auto',
        visibility: (showFront) ? 'visible' : 'hidden'
        }}/>
      <img src={backImageSrc} draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        cursor:'pointer',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        marginTop:'auto',
        position: 'absolute',
        visibility: (!showFront) ? 'visible' : 'hidden',
        display:(isCardDoublesided(card)) ? 'block' : 'none'
        }}/>
      {(isCardDoublesided(card)) &&
      <div 
        onPointerDown={handleDoublesidedPointerDown}
        onPointerUp={handleDoublesidedPointerUp}
        style={{
        borderRadius:'50%',
        position:'absolute',
        left:(showFront) ? doubleSidedCircleOffset.x + 'px' : `${dims.width - doubleSidedCircleOffset.w - doubleSidedCircleOffset.x}px`,
        top:doubleSidedCircleOffset.y + 'px',
        width:doubleSidedCircleOffset.w + 'px',
        height:doubleSidedCircleOffset.h + 'px',
        backgroundColor:'transparent',
        visibility:(mousedover) ? 'visible' : 'hidden',
        transition:'box-shadow 0.3s ease',
        boxShadow: (mousedover) ?
          '0px 0px 5px 5px rgba(236, 236, 26), inset 0px 0px 2px 3px rgba(236, 236, 26, 1)' :
          'none',
        cursor:'grab',
      }}/>  
      }
    </div>);
};