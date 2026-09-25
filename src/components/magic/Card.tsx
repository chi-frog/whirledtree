'use client'

import { _wpoint } from "@/helpers/wpoint";
import { isCardDoublesided, MagicCard } from "./types/default";
import { memo, PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragStage, useDragContext } from "../general/DragProvider";
import useCardRotate from "@/hooks/magic/useCardRotate";
import useCardDrag from "@/hooks/useCardDrag";
import { cardAspectRatio, transformMagicCard } from "@/hooks/magic/useMagicCards";
import { motion } from "framer-motion";
import { fetchImage, useImageRepositoryContext } from "../general/ImageRepoProvider";
import { useIsCardInModal, useModalContext } from "../general/ModalProvider";
import CardFace from "./CardFace";
import DoublesidedOverlay from "./card/DoublesidedOverlay";
import { PrintSide } from "./types/imageRepo";
import useExternalData from "@/hooks/useExternalData";

export type CardLocation =
  'view' | 'modal';
type Props = {
  location:CardLocation,
  widthString?:string,
  heightString?:string,
  card:MagicCard,
  visible?:boolean,
};
export const Card:React.FC<Props> = memo(function Card({
    location,
    widthString,
    heightString,
    card,
    visible=true,
  }:Props) {
  const [reversed, setReversed] = useState<boolean>(false);
  // Consider making this a ref
  const [isRaised, setIsRaised] = useState(false);
  const isAnimating = useRef<{s:boolean, img:string|undefined}>({s:false, img:undefined});
  const [node, setNode] = useState<HTMLDivElement|null>(null);
  const onDragEnd = useCallback(() => { setIsRaised(false) }, []);

  const {addImage, getPrint} = useImageRepositoryContext();
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, startDraggingCard] = useCardDrag(startDragging, dragStateRef, onDragEnd);
  const [rotateState, rotateStateRef, startRotating, forceRotate] =
    useCardRotate(node, subDrag, startDragging, dragStateRef);

  const mousedoverRef = useRef<boolean>(false);
  const [mousedover, setMousedover] = useState<boolean>(false);
  const ref = useCallback((el:HTMLDivElement|null) => setNode(el), []);
  const raf = useRef<number>(-1);
  const lastMousePress = useRef<React.PointerEvent|undefined>(undefined);

  const imgSize = useMemo(() => (location === 'modal') ? 'large' : 'small', [location]);

  const print = getPrint(card.oracleId, card.id);
  const [frontImgSrc, setFrontImgSrc] = useState<string|undefined>(
    (print?.front.large && (print?.front.large !== '')) ?
      print?.front.large :
      print?.front.small);
  const [backImgSrc, setBackImgSrc] =
    useState<string|undefined>(print?.back.large ?? print?.back.small);
  
  const {showModal} = useModalContext();
  const isInModal = useIsCardInModal(card.name);

  if (card.name === 'Aang, Air Nomad' && visible) {
    console.log('frontImgSrc:' + frontImgSrc + ' | location:' + location);
    console.log('print', print);
  }

  const flipping = useMemo(() => (rotateState.angle > 90), [rotateState.angle]);
  const showFront = useMemo(() =>
      ((!reversed && !flipping) ||
       (reversed && flipping)), [reversed, flipping]);

  const loadingFrontImg = useRef<boolean>(false);
  const loadingBackImg = useRef<boolean>(false);

  async function getImageUrl(url:string, side:PrintSide) {
    const blob = await fetchImage(url);
    if (!blob) return;

    addImage(card.oracleId, card.id, side, imgSize, blob);

    if (side === 'front') {
      setFrontImgSrc(blob);
      loadingFrontImg.current = false;

    } else {
      setBackImgSrc(blob);
      loadingBackImg.current = false;
    }
  }

  useEffect(() => {
    if ((!loadingFrontImg.current) &&
        ((!frontImgSrc) ||
         (frontImgSrc === ''))) {
      // Only get the image if we can't find it in the repo
      loadingFrontImg.current = true;
      getImageUrl(card.imageUris[imgSize], 'front');
    }
  }, [frontImgSrc]);

  useEffect(() => {
    if (((!backImgSrc) ||
         (backImgSrc === '')) &&
        (card.back)) {
      //getImageUrl(card.back.imageUris[imgSize], 'back');
    }
  }, [frontImgSrc]);

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
    if (isAnimating.current.s)
      return;
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
  }, [showModal]);

  const handleRotationPointerDown = useCallback((e:React.PointerEvent<Element>, dir:-1|1|undefined=undefined) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (e.button !== 0) return;
  
    if (!dir) dir = (reversed) ? -1 : 1
    startRotating(e, dir);
    lastMousePress.current = e;
  }, [reversed, node]);

  const handleRotationPointerUp:PointerEventHandler = useCallback((e) => {
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

  const rotationBar = useCallback((left:string='0', dir:-1|1=1) => {
    return (
      <div
        className="leftSideRotate"
        onPointerDown={(e) => handleRotationPointerDown(e, dir)}
        onPointerUp={handleRotationPointerUp}
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
  }, [handleRotationPointerUp, handleRotationPointerDown]);

  return (<>
    <motion.div
      layoutId={(location === 'view' && isInModal) ? undefined : card.id}
      layout={!dragging}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onLayoutAnimationComplete={() => {
        setIsRaised(false);
        if (location === 'view') return;
        isAnimating.current.s = false;
        isAnimating.current.img = undefined;
      }}
      onLayoutAnimationStart={() => {
        setIsRaised(true);
        if (location === 'view') return;
        isAnimating.current.s = true;
        isAnimating.current.img =
          (showFront) ? frontImgSrc : backImgSrc;
      }}
      style={{
        cursor:'pointer',
        margin:(location === 'view') ? '5px' : '0px',
        width:widthString,
        height:heightString,
        aspectRatio:cardAspectRatio,
        position:(location === 'modal') ? 'absolute' : 'relative',
        zIndex: (isRaised) ? 30 : 0,
        opacity: ((!visible) || (location === 'view' && isInModal)) ? 0 : 1,
        pointerEvents: (location === 'view' && isInModal) ? 'none' : undefined,
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
      <CardFace loc={location} src={frontImgSrc} visible={showFront}/>
      <CardFace loc={location} src={backImgSrc} visible={!showFront}/>
      { isCardDoublesided(card) &&
        <DoublesidedOverlay 
          cardMousedover={mousedover}
          node={node}
          set={card.set}
          showFront={showFront}
          pointerDown={handleRotationPointerDown}
          pointerUp={handleRotationPointerUp}
        />
      }
      {rotationBar("", 1)}
      {rotationBar("calc(100% - 10px)", -1)}
      </div>
      {location === 'view' && (
      <motion.div
        layoutId={`inner-${card.id}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          inset: 0,        // matches the card's own bounds exactly
          pointerEvents: 'none',
      }}/>)}
    </motion.div></>);
});