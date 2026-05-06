'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { MagicCard, MagicFormat, } from "./types/default";
import useRefMap from "@/hooks/useRefMap";
import Filter from "./filters/Filter";
import { capitalize } from "@/helpers/string";
import useMagicSets from "@/hooks/magic/useMagicSets";
import Modal from "./Modal";
import useFilters from "@/hooks/magic/useFilters";
import View from "./View";
import { _wpoint, makeWPoint, WPoint } from "@/helpers/wpoint";
import useMagicCards from "@/hooks/magic/useMagicCards";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import useCardDrag from "@/hooks/useCardDrag";
import useMagicDatabase from "@/hooks/magic/useMagicDatabase";

const yCutoffHidden = 10;

export enum FilterState {
  HIDDEN = 'hidden',
  REDUCED = 'reduced',
  WHOLE = 'whole',
}

export enum WErrorCode {
  NO_ERROR = 'no_error',
  NOT_FOUND = 'not_found',
}
export type WError = {
  code:WErrorCode,
  info?:any,
}
export const _noError = {
  code:WErrorCode.NO_ERROR,
};
export const _notFound = (info:any) =>
  ({code:WErrorCode.NOT_FOUND, info})

export type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };

export type ImageMap = Map<string, ImagePacket>;

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

type Props = {};
const CardDisplay:React.FC<Props> = () => {
  const {url, selected, updateSelected, handlers} = useFilters();
  const [errors, loadMap, formats, sets, cards, imageMap, hydrateLargeImage] = useMagicDatabase(url);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const [filterGlow, setFilterGlow] = useState<number>(0);
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [modalCard, setModalCard] = useState<MagicCard|null>(null);
  const {getMap, getRef} = useRefMap();
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);
  const [draggingCardIndex, cardDragMap, startDraggingCard, stopDraggingCard] = useCardDrag(subDrag, startDragging, dragStateRef);

  const dragging = useMemo(() => {
    return dragState.stage === DragStage.ACTIVE;
  }, [dragState.stage]);

  const onDragView = (e:PointerEvent) => {
    window.scrollTo(window.scrollX + dragStateRef.current.delta.x, window.scrollY - dragStateRef.current.delta.y*2);
  }

  const onDragViewStart = ({x, y}:PointerEvent) => {
    setDragState({...dragStateRef.current});
  }

  const onDragViewEnd = (e:PointerEvent) => {
    setDragState({...dragStateRef.current});
  }

  const viewTag = 'view';
  useEffect(() => {
    subDrag({tag:viewTag,
             onDragStart:onDragViewStart,
             onDrag:onDragView,
             onDragEnd:onDragViewEnd})
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-select", dragging);
  }, [dragging]);

  useMouseLeavePage(() => {
    setFilterGlow(0);
  });

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (!isNaN(value)) setNumCardsRow(value);
  };


  const resetFilterGlow = (filterState:FilterState, y:number) => {
    if (filterState === FilterState.REDUCED && y <= yCutoffHidden)
      console.log('helekjkjf');
    setFilterGlow((filterState === FilterState.HIDDEN && y <= yCutoffHidden)  ? 10 :
                  (y <= yCutoffHidden)                                        ? -3 :
                  (filterState === FilterState.REDUCED && y > 50 && y <= 80) ? 10 :
                                                                                0);
  }

  const handleFilterArrowPointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();
  };

  const handleFilterArrowPointerUp:PointerEventHandler = (e) => {
    e.stopPropagation();

    const _filterState =
      (filterState === FilterState.HIDDEN)  ? FilterState.REDUCED :
      (filterState === FilterState.REDUCED) ? FilterState.WHOLE :
      (filterState === FilterState.WHOLE)   ? FilterState.REDUCED :
                                              filterState;

    setFilterState(_filterState);
    resetFilterGlow(_filterState, e.clientY);
  };

  const handlePointerDown = (e:React.PointerEvent) => {
    startDragging(e, viewTag);
  };

  const handlePointerMove:PointerEventHandler = (e) => {
    if (!modalShown) resetFilterGlow(filterState, e.clientY)
  };

  const handlePointerUp:PointerEventHandler = (e) => {
  };

  const handleCardPointerDown = (e:React.PointerEvent, index:number) => {
    e.stopPropagation();

    startDraggingCard(e, index);
    setDragState({...dragStateRef.current});
  };

  const handleCardPointerUp = async (e:React.PointerEvent, index:number) => {
    e.stopPropagation();

    setDragState(dragStateRef.current);
    stopDraggingCard(e);

    if ((e.button !== 2) &&
        (e.clientX === dragState.start.x) &&
        (e.clientY === dragState.start.y)) {
      setModalShown(true);
      setModalCard(cards[index]);
      hydrateLargeImage(index);
    }
  };
  
  const handleFilterPointerDown:PointerEventHandler = (e) => {
    e.stopPropagation();
  };

  const handleFilterPointerUp:PointerEventHandler = (e) => {
    if (!filterHidden &&
        e.clientY <= yCutoffHidden) {
      setFilterState(FilterState.HIDDEN);
      resetFilterGlow(FilterState.HIDDEN, e.clientY);
    }

    e.stopPropagation();
  };

  const filterHidden = (filterState === FilterState.HIDDEN);

  return (
  <div
    onPointerUp={handlePointerUp}
    onPointerMove={handlePointerMove}
    onPointerDown={(e)=>handlePointerDown(e)}>
    <Filter
      handleArrowPointerDown={handleFilterArrowPointerDown} handleArrowPointerUp={handleFilterArrowPointerUp}
      handlePointerDown={handleFilterPointerDown} handlePointerUp={handleFilterPointerUp}
      state={filterState} glow={filterGlow}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selectedSet={selected.set} onChangeSet={handlers.set}
      selectedFormat={selected.format} onChangeFormat={handlers.format}
      selectedName={selected.name} onChangeName={handlers.name}
      sets={sets} cards={cards} formats={formats}/>
    {errors.length > 0 && 
      <View loaded={loadMap.get('images')} getRef={getRef}
        dragState={dragState}
        cardDragMap={cardDragMap}
        filterState={filterState}
        yCutoffHidden={yCutoffHidden}
        numCardsRow={numCardsRow}
        cards={cards}
        imageMap={imageMap}
        handleCardPointerDown={handleCardPointerDown}
        handleCardPointerUp={handleCardPointerUp}/>
    }
    {cards.length === 0 &&
      <div id="error_screen" style={{
        width:'100vw',
        height: '100vh',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontSize:'48px',
        fontWeight:'bold',
      }}>
        <h1> No cards matched your search! </h1>
      </div>
    }
    {modalShown &&
    <Modal
      close={()=>setModalShown(false)}
      card={modalCard}
      index={cards.findIndex((_card) => (_card === modalCard))}
      imagePacket={(modalCard) ? imageMap.get(modalCard.name) : undefined}/>}
  </div>)
};

export default CardDisplay;