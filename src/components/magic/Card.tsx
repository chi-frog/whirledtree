'use client'

import { _wpoint } from "@/helpers/wpoint";
import { isCardDoublesided, MagicCard } from "./types/default";
import { memo, PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragStage, useDragContext } from "../general/DragProvider";
import useCardRotate from "@/hooks/magic/useCardRotate";
import useCardDrag from "@/hooks/useCardDrag";
import { cardAspectRatio, createImagePacket, fetchImage, ImagePacket, ImageSet } from "@/hooks/magic/useMagicCards";
import { motion } from "framer-motion";
import { useImageRepositoryContext } from "../general/ImageRepoProvider";
import { useModalContext } from "../general/ModalProvider";
import { useCardRepositoryContext } from "../general/CardRepoProvider";
import CardFace from "./CardFace";

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
  widthString?:string,
  heightString?:string,
  imageHeightString?:string,
  card:MagicCard,
  cardBackImagePacket?:ImagePacket,
};
export const Card:React.FC<Props> = memo(function Card({
    location,
    widthString,
    heightString,
    imageHeightString,
    card,
    cardBackImagePacket,
  }:Props) {
  const [reversed, setReversed] = useState<boolean>(false);
  const [isRaised, setIsRaised] = useState(false);
  const isAnimating = useRef<boolean>(false);
  const [node, setNode] = useState<HTMLDivElement|null>(null);
  const onDragEnd = useCallback(() => { setIsRaised(false) }, []);

  const {addImage, getImagePacket} = useImageRepositoryContext();
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, startDraggingCard] = useCardDrag(startDragging, dragStateRef, onDragEnd);
  const [rotateState, rotateStateRef, startRotating, forceRotate] =
    useCardRotate(node, subDrag, startDragging, dragStateRef);

  const [dims, setDims] = useState({ x:0, y:0, width: 0, height: 0 });
  const mousedoverRef = useRef<boolean>(false);
  const [mousedover, setMousedover] = useState<boolean>(false);
  const ref = useCallback((el:HTMLDivElement|null) => setNode(el), []);
  const raf = useRef<number>(-1);
  const lastMousePress = useRef<React.PointerEvent|undefined>(undefined);

  const repoImagePacket = getImagePacket(card);

  const [frontImageSet, setFrontImageSet] = useState<ImageSet|undefined>(undefined);
  const [backImageSet, setBackImageSet] = useState<ImageSet|undefined>(undefined);
  const {showModal} = useModalContext();

  const flipping = useMemo(() => rotateState.angle > 90, [rotateState.angle]);
  const showFront = useMemo(() =>
      ((!reversed && rotateState.angle <= 90) ||
       (reversed && rotateState.angle > 90)), [reversed, rotateState.angle]);
  const showBack = useMemo(() =>
      ((reversed && rotateState.angle <= 90) ||
       (!reversed && rotateState.angle > 90)), [reversed, rotateState.angle]);

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

  useEffect(() => {
    const size = (location === 'view') ?
      'small' :
      'large';
    const repoImagePacket = getImagePacket(card);

    async function getImage(side:keyof ImagePacket) {
      if (side === 'back' && !card.back) {
        setBackImageSet(undefined);
        return;
      }

      if ((repoImagePacket) &&
          (repoImagePacket[side][size])) {
        if (side === 'front')
          setFrontImageSet(repoImagePacket.front);
        else if (side === 'back')
          setBackImageSet(repoImagePacket.back);
        return;
      }

      const newImagePacket = (repoImagePacket) ?
        repoImagePacket :
        createImagePacket();

      const blob =
        (side === 'front') ? 
          await fetchImage(card.imageUris[size]) :
        (card.back) ?
          await fetchImage(card.back.imageUris[size]) :
          null;
      if (!blob) return;

      newImagePacket[side][size] = blob;
      addImage(card, blob, side, size);

      if (side === 'front')
        setFrontImageSet(newImagePacket.front);
      else if (side === 'back')
        setBackImageSet(newImagePacket.back);
    }

    getImage('front');
    getImage('back');
  }, [card.imageUris, location]);

  const [frontImageSrc, backImageSrc] = useMemo(() => {
    if (!card) return [];

    if (isAnimating) {
      //console.log('Being Animated!!');
    }

    const getHighestQualityImage = (set:ImageSet|undefined) =>
      (!set) ?
        undefined :
      (set.large) ?
        set.large :
      (set.small) ?
        set.small :
        undefined;

    let front = getHighestQualityImage(frontImageSet);
    let back = getHighestQualityImage(backImageSet);
    const repoImagePacket = getImagePacket(card);

    if ((!front) &&
        (repoImagePacket))
      front = getHighestQualityImage(repoImagePacket.front);

    if ((!back) &&
        (repoImagePacket))
      back = getHighestQualityImage(repoImagePacket.back);

    if ((!back) || back === "")
      back = cardBackImagePacket?.front.large;

    return [front, back];
  }, [cardBackImagePacket, frontImageSet, backImageSet]);

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
    node.style.outline = "1px solid rgb(146, 148, 248)";
    node.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging && (location === 'view'))
      node.style.top = "-3px";

    const change = () => {
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

      const selectedBoxShadow = `0px 0px 15px 10px rgba(253, 220, 92, ${opacity})`;
      const mouseoverBoxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;

      node.style.boxShadow = (version) ?
        selectedBoxShadow:
        mouseoverBoxShadow;

      raf.current = requestAnimationFrame(change);
    };

    raf.current = requestAnimationFrame(change);

    return () => cancelAnimationFrame(raf.current);
  }, [node]);

  const handleCardPointerEnter = () => {
    glow(false);
    mousedoverRef.current = true;
    setMousedover(true);
  };

  const handleCardPointerLeave = () => {
    if ((!node)) return;

    if (location !== "modal")
      node.style.outline = '1px solid rgba(255, 255, 255, 0.7)'
    else
      node.style.outline = "";
    node.style.boxShadow = "none";
    node.style.position = "auto";
    node.style.top = "";

    mousedoverRef.current = false;
    lastMousePress.current = undefined;
    setMousedover(false);
    cancelAnimationFrame(raf.current);
  };

  const handleCardPointerMove = useCallback((e:React.PointerEvent) => {
    if ((lastMousePress.current) &&
        (dragStateRef.current.stage === DragStage.INACTIVE) &&
        !(e.clientX === lastMousePress.current.clientX) &&
        !(e.clientY === lastMousePress.current.clientY)) {
      startDraggingCard(lastMousePress.current);
    }
  }, []);

  const handleCardPointerDown = useCallback((e:React.PointerEvent) => {
    e.stopPropagation();

    if (e.button !== 0) return;

    setIsRaised(true);
    glow(true);
    lastMousePress.current = e;
    console.info('card', card);
  }, [glow]);

  const handleCardPointerUp = useCallback((e:React.PointerEvent) => {
    if (e.button !== 0) return;

    if ((lastMousePress.current) &&
        (e.clientX === lastMousePress.current.clientX) &&
        (e.clientY === lastMousePress.current.clientY)) {
      showModal(card);
      setIsRaised(false);
      cancelAnimationFrame(raf.current);
      if (node)
        node.style.boxShadow = "none";
    }

    lastMousePress.current = undefined;
  }, [glow]);

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

    if (e.button !== 0) return;

    if (!dir) dir = (reversed) ? -1 : 1
    startRotating(e, dir);
    lastMousePress.current = e;
  }, [reversed, node]);

  const handleDoublesidedPointerUp:PointerEventHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0) return;

    if ((lastMousePress.current) &&
        (e.clientX === lastMousePress.current.clientX) &&
        (e.clientY === lastMousePress.current.clientY)) {
      setReversed((prev) => !prev);
      forceRotate(180);
      lastMousePress.current = undefined;
      return;
    }

    lastMousePress.current = undefined;

    const angle = rotateStateRef.current.angle;
    if (angle > 90) {
      setReversed((prev) => !prev);
      forceRotate(180 - angle);
    }
  }, [node]);

  const loadFace = useMemo(() => {
    return (
      <img src={cardBackImagePacket?.front.large} loading="lazy"
        draggable={false}
        style={{
        width:'100%',
        height:'100%',
        ...(imageHeightString && { height: imageHeightString }),
        marginTop:'auto',
        aspectRatio: cardAspectRatio,
        transition: 'opacity 1s ease-in-out',
        position:'absolute',
        pointerEvents:'none',
        visibility: (!showFront && !showBack) ? 'visible' : 'hidden',
        userSelect: 'none',
          WebkitUserSelect: 'none',
      }}/>
    )
  }, [showFront, showBack, imageHeightString, cardBackImagePacket]);

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
      layout={!dragging}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onLayoutAnimationComplete={() => {
        setIsRaised(false);
        isAnimating.current = false;
        console.log('Lowering (' + location + ")");
      }}
      onLayoutAnimationStart={() => {
        setIsRaised(true);
        isAnimating.current = true;
        console.log('Raising (' + location + ")");
      }}
      style={{
        cursor:'pointer',
        margin:(location === 'view') ? '5px' : '0px',
        width:widthString,
        height:heightString,
        aspectRatio:cardAspectRatio,
        position: 'relative',
        zIndex: (isRaised) ? 30 : 0,
      }}>
      <div
        ref={ref}
        onPointerEnter={handleCardPointerEnter}
        onPointerLeave={handleCardPointerLeave}
        onPointerDown={handleCardPointerDown}
        onPointerUp={handleCardPointerUp}
        onPointerMove={handleCardPointerMove}
        style={{
        width:'100%',
        height:'100%',
        position:'relative',
        overflow:'hidden',
        transition:'outline 1s ease-in-out',
        borderRadius:(location ==='view') ? '12px' : '20px',
        outline:
           (location !== "modal") ?
            '1px solid rgba(255, 255, 255, 0.7)' :
            'none',
        transform:
          (dragState && dragState.stage !== DragStage.INACTIVE) ?
            `translate3d(${x}px, ${y}px, 0) perspective(1000px) rotate3d(0, 1, 0, ${(angle) ? angle.x : 0}deg) rotate3d(1, 0, 0, ${(angle) ? angle.y*-1 : 0}deg)` :
          (rotateState.stage !== DragStage.INACTIVE) ?
          (!flipping) ?
            `rotate3d(0, 1, 0, ${rotateState.angle}deg)` :
            `rotate3d(0, 1, 0, ${180 - rotateState.angle}deg)` :
            '',
      }}>
      <CardFace src={frontImageSrc} visible={showFront} height={imageHeightString}/>
      <CardFace src={backImageSrc} visible={showBack} height={imageHeightString}/>
      { isCardDoublesided(card) &&
        doublesidedCircle
      }
      {rotationBar("", 1)}
      {rotationBar("calc(100% - 10px)", -1)}
      </div>
      {location === 'view' && (
      <motion.div
        layoutId={`inner-${card.name}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          inset: 0,        // matches the card's own bounds exactly
          pointerEvents: 'none',
      }}/>)}
    </motion.div>);
});