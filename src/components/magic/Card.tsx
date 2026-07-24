'use client'

import { _wpoint, areEqualWPoints, WPoint } from "@/helpers/wpoint";
import { isCardDoublesided, MagicCard } from "./types/default";
import { ImagePacket } from "./CardDisplay";
import { memo, PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragStage, useDragContext } from "../general/DragProvider";
import useCardRotate from "@/hooks/magic/useCardRotate";
import useCardDrag from "@/hooks/useCardDrag";
import { cardAspectRatio } from "@/hooks/magic/useMagicCards";
import { motion } from "framer-motion";

// As the cards load, first 
enum LoadSequence {
  PRE_BACKGROUND = 'preBackground',
  PRE_IMAGE = 'preImage',
  IMAGE = 'image',
}

export type CardLocation =
  'view' | 'modal';
type Props = {
  location:CardLocation,
  index:number,
  widthString:string,
  heightString?:string,
  imageHeightString?:string,
  card:MagicCard,
  frontImagePacket?:ImagePacket,
  backImagePacket?:ImagePacket,
  cardBackImagePacket?:ImagePacket,
  handlePointerUp?:(e:React.PointerEvent, index:number, x:number, y:number) => void,
};
export const Card:React.FC<Props> = memo(function Card({
    location,
    index,
    widthString,
    heightString,
    imageHeightString,
    card,
    frontImagePacket,
    backImagePacket,
    cardBackImagePacket,
    handlePointerUp,
  }:Props) {
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dims, setDims] = useState({ x:0, y:0, width: 0, height: 0 });
  const [mousedover, setMousedover] = useState<boolean>(false);
  const [node, setNode] = useState<HTMLDivElement|null>(null);
  const ref = useCallback((el:HTMLDivElement|null) => setNode(el), []);
  const raf = useRef<number>(-1);
  const [rotateState, startRotating, forceRotate] =
    useCardRotate(node, subDrag, startDragging, dragStateRef);
  const lastMousePress = useRef<WPoint>(_wpoint);
  const [dragState, startDraggingCard] = useCardDrag(subDrag, startDragging, dragStateRef);
  const [loadSequence, setLoadSequence] = useState<LoadSequence>(LoadSequence.PRE_BACKGROUND);
  const [reversed, setReversed] = useState<boolean>(false);

  const flipping = useMemo(() => rotateState.angle > 90, [rotateState.angle]);
  const showFront = useMemo(() =>
    (loadSequence === LoadSequence.IMAGE) &&
      ((!reversed && rotateState.angle <= 90) ||
       (reversed && rotateState.angle > 90)), [reversed, rotateState.angle, loadSequence]);
  const showBack = useMemo(() =>
    (loadSequence === LoadSequence.IMAGE) &&
      ((reversed && rotateState.angle <= 90) ||
       (!reversed && rotateState.angle > 90)), [reversed, rotateState.angle, loadSequence]);  

useEffect(() => {
  if (!node) return;

  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { x, y } = entry.target.getBoundingClientRect();
      setDims({
        x, y,
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    }
  });

  observer.observe(node);
  return () => observer.disconnect();
}, [node]);

  const imageSrc = useMemo(() =>
    (!card || !frontImagePacket) ? undefined :
    (frontImagePacket.largeBlob) ? frontImagePacket.largeBlob :
                                   frontImagePacket.smallBlob
  , [frontImagePacket]);

  const backImageSrc = useMemo(() =>
    ((!card) || (!backImagePacket)) ? undefined :
    (backImagePacket.largeBlob)     ? backImagePacket.largeBlob :
                                      backImagePacket.smallBlob
    , [backImagePacket, card.layout]);

  const x = useMemo(() => 
    (dragState) ? (dragState.point.x - dragState.start.x) : 0, [dragState]);
  const y = useMemo(() =>
    (dragState) ? (dragState.point.y - dragState.start.y) : 0, [dragState]);
  const angle = useMemo(() =>
    (dragState) ? (dragState.angle) : 0, [dragState]);
  const dragging = useMemo(() =>
    (dragState) ? (dragState.stage === DragStage.ACTIVE) : 0, [dragState?.stage]);

  const glow = useCallback((version:boolean) => {
    if (!node) return;

    cancelAnimationFrame(raf.current);

    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;
    node.style.border = "1px solid rgb(146, 148, 248)";
    node.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging && (location === 'view'))
      node.style.top = "-3px";

    const change = () => {
      if (node.style.boxShadow === 'none') {
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

      node.style.boxShadow = (version) ?
        selectedBoxShadow:
        mouseoverBoxShadow;

      raf.current = requestAnimationFrame(change);
    };

    raf.current = requestAnimationFrame(change);

    return () => cancelAnimationFrame(raf.current);
  }, [node]);

  const handleCardPointerEnter = (e:React.PointerEvent) => {
    glow(false);
    setMousedover(true);
  };

  const handleCardPointerLeave = (e:React.PointerEvent) => {
    if (!node) return;

    node.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    node.style.boxShadow = "none";
    node.style.position = "auto";
    node.style.top = "";

    setMousedover(false);
  };

  const handleCardPointerDown = (e:React.PointerEvent) => {
    e.stopPropagation();
    startDraggingCard(e);
    glow(true);
    lastMousePress.current = {x:e.clientX, y:e.clientY}; 
    console.info('card', card);
  }

  const handleCardPointerUp = (e:React.PointerEvent) => {
    if (handlePointerUp)
      handlePointerUp(e, index, lastMousePress.current.x, lastMousePress.current.y);
    glow(false);
  }

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
      if (!node) return def;

      return (card.set === 'tla') ? tlaRatios(dims) :
             (card.set === 'khm') ? khmRatios(dims) :
                                    tlaRatios(dims);
    }
    return def;
  }, [dims, node]);

  const handleDoublesidedPointerDown = useCallback((e:React.PointerEvent<Element>, dir:-1|1|undefined=undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dir) dir = (reversed) ? -1 : 1
    startRotating(e, dir);
    lastMousePress.current = {x:e.clientX, y:e.clientY};
  }, [reversed, node]);

  const handleDoublesidedPointerUp:PointerEventHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const point = {x:e.clientX, y:e.clientY};

    if (areEqualWPoints(point, lastMousePress.current)) {
      setReversed((prev) => !prev);
      forceRotate(180);
    }

    if (flipping) {
      setReversed((prev) => !prev);
      forceRotate(90 - (rotateState.angle - 90));
    }
  }, [flipping, reversed, node]);

  const bgOnLoad = useCallback(() => {
    setLoadSequence((prev) => {
      return prev === (LoadSequence.PRE_BACKGROUND) ? LoadSequence.PRE_IMAGE : prev
    });
  }, [loadSequence]);

  const imgOnLoad = useCallback(() => {
    setLoadSequence(LoadSequence.IMAGE);
  }, [loadSequence]);

  const frontFace = useMemo(() => {
    return (
      <img src={imageSrc} loading="lazy" draggable="false" onLoad={imgOnLoad} style={{
        width:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        marginTop:'auto',
        position:'absolute',
        visibility: (showFront) ? 'visible' : 'hidden'
        }}/>
    )
  }, [imageHeightString, showFront, loadSequence, imageSrc]);

  const backFace = useMemo(() => {
    return (
      <img src={backImageSrc} loading="lazy" draggable="false" style={{
        maxWidth:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        marginTop:'auto',
        position: 'absolute',
        visibility: (showBack) ? 'visible' : 'hidden',
        }}/>
    )
  }, [backImageSrc, imageHeightString, showBack, loadSequence]);

  const loadFace = useMemo(() => {
    return (
      <img src={cardBackImagePacket?.largeBlob} loading="lazy" onLoad={bgOnLoad} style={{
        width:'100%',
        height:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        marginTop:'auto',
        aspectRatio: cardAspectRatio,
        opacity: (loadSequence === LoadSequence.PRE_BACKGROUND) ? 0 : 1,
        transition: 'opacity 1s ease-in-out',
        position:'absolute',
        pointerEvents:'none',
        visibility: (!showFront && !showBack) ? 'hidden' : 'visible',
      }}/>
    )
  }, [imageHeightString, loadSequence, cardBackImagePacket]);

  const doublesidedCircle = useMemo(() => {
    return (
      <div 
        onPointerDown={(e) => handleDoublesidedPointerDown(e)}
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
        cursor:'url("images/Cursor_Rotate.svg") 16 16, auto',
      }}/>
    )
  }, [showFront, handleDoublesidedPointerDown, handleDoublesidedPointerUp, dims.width, doubleSidedCircleOffset, mousedover])

  const rotationBar = useCallback((left:string='0', dir:-1|1=1) => {
    return (
      <div
        className="leftSideRotate"
        onPointerDown={(e) => handleDoublesidedPointerDown(e, dir)}
        onPointerUp={handleDoublesidedPointerUp}
        style={{
          width:"10px",
          height:"100%",
          backgroundColor:'transparent',
          position:'absolute',
          left:left,
          zIndex:10,
          cursor:'url("images/Cursor_Rotate.svg") 16 16, auto',
        }}
        />
    )
  }, [handleDoublesidedPointerUp, handleDoublesidedPointerDown]);

  return (
    <motion.div
      layoutId={card.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        cursor:'pointer',
        margin:(location === 'view') ? '5px' : '0px',
        width:widthString,
        height:heightString,
        aspectRatio:cardAspectRatio,
        position: 'relative',
        zIndex: (dragState.stage !== DragStage.INACTIVE) ? 30 : 0,
        }}>
      <div
        ref={ref}
        onPointerEnter={(e)=>handleCardPointerEnter(e)}
        onPointerLeave={(e)=>handleCardPointerLeave(e)}
        onPointerDown={(e) => handleCardPointerDown(e)}
        onPointerUp={(e) => handleCardPointerUp(e)}
        style={{
        width:'100%',
        height:'100%',
        position:'relative',
        overflow:'hidden',
        transition:'border 1s ease-in-out',
        borderRadius:(location ==='view') ? '12px' : '20px',
        border:(loadSequence !== LoadSequence.PRE_BACKGROUND) ? '1px solid rgba(255, 255, 255, 0.7)' : 'none',
        transform:
          (dragState && dragState.stage !== DragStage.INACTIVE) ?
            `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          (rotateState.stage !== DragStage.INACTIVE) ?
          (!flipping) ?
            `rotate3d(0, 1, 0, ${rotateState.angle}deg)` :
            `rotate3d(0, 1, 0, ${90 - (rotateState.angle - 90)}deg)` :
            '',
      }}>
      {loadFace}
      {frontFace}
      {backFace}
      { isCardDoublesided(card) &&
        doublesidedCircle
      }
      {rotationBar("", 1)}
      {rotationBar("calc(100% - 10px)", -1)}
      </div>
    </motion.div>);
});