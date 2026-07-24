'use client'

import { ChangeEventHandler,   UIEventHandler,   useCallback, useEffect, useMemo, useRef, useState } from "react";
import { _magicCard, isCardDoublesided, MagicCard, MagicFormat, MagicSet, } from "./types/default";
import Filter from "./filters/Filter";
import Modal from "./Modal";
import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import View from "./View";
import { _wpoint } from "@/helpers/wpoint";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import { ErrorMap, LoadMap, MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";
import { ModalProvider, useModalContext } from "../general/ModalProvider";

export enum FilterState {
  HIDDEN = 'hidden',
  REDUCED = 'reduced',
  WHOLE = 'whole',
}

export enum WErrorCode {
  NO_ERROR = 'no_error',
  NOT_FOUND = 'not_found',
  GENERAL = 'general',
}
export type WError = {
  code:WErrorCode,
  info?:any,
}
export const _noError = {
  code:WErrorCode.NO_ERROR,
};
export const _notFound = (info:any) =>
  ({code:WErrorCode.NOT_FOUND, info});
export const _err = (err:any) =>
  ({code:WErrorCode.GENERAL, err});

export type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };

export type ImageMap = Map<string, ImagePacket>;

type Props = {
  db:MagicDatabase,
  selected:Selected,
  updateSelected:FilterUpdateFunction,
  handlers:Record<keyof Selected, ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>
};
const CardDisplay:React.FC<Props> = ({
  db, selected, updateSelected, handlers
}) => {
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);
  const [cards, setCards] = useState<MagicCard[]>(db.cards);
  const scrollTrigger = useRef<HTMLDivElement|null>(null);
  const {showModal, hideModal} = useModalContext();

  const changeCard = useCallback((index:number, card:MagicCard) =>
    setCards((prev) => prev.map((_card, _index) => (_index === index) ? card : _card)), []);

  useEffect(() => {
    console.log('-----db.cards-----');

    console.log('TOTAL CARDS CHANGED', db.totalCards);
    console.log('message', db);
    console.log('-----db.cards-----');

    setCards(db.cards);
  } , [db.cards]);

  const dragging = useMemo(() => dragState.stage === DragStage.ACTIVE, [dragState.stage]);

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

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const value = parseInt(e.target.value);

    if (!isNaN(value)) setNumCardsRow(value);
  }, []);

  const handlePointerDown = useCallback((e:React.PointerEvent) => {
    startDragging(e, viewTag);
  }, [viewTag]);

  const handleCardPointerUp = useCallback(async (e:React.PointerEvent, index:number, x:number, y:number) => {
    e.stopPropagation();

    if ((e.button !== 2) &&
        (e.clientX === x) &&
        (e.clientY === y)) {
      showModal(index);
      db.hydrateLargeImage(index);
    }
  }, [cards, db.imageMap]);

  const hasCardsError:boolean = useMemo(() => {
    const cardsError = db.errorMap.get('cards');
    console.log('cardsError', cardsError);
    return cardsError ? cardsError.length > 0 : true;
  }, [db.errorMap]);

  const cardsLoaded:boolean = useMemo(() => {
    const cardsLoaded = db.loadMap.get('cards');
    return cardsLoaded === true;
  }, [db.loadMap]);

  const isFetchingRef = useRef(false);

  useEffect(() => {
    const el = scrollTrigger.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && db.fetchNextData && !isFetchingRef.current) {
          isFetchingRef.current = true;
          console.log('starting to load');
          observer.unobserve(el);
          Promise.resolve(db.fetchNextData()).finally(() => {
            isFetchingRef.current = false;
          });
        }
      });
    }, { rootMargin: '3000px' });

    observer.observe(el);

    return () => observer.disconnect();
  }, [cards]);

  return (
  <div
    onPointerDown={handlePointerDown}>
    <Filter
      setState={setFilterState}
      state={filterState}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selected={selected} handlers={handlers}
      sets={db.sets} cards={cards} formats={db.formats} types={db.types}/>
    {(cards.length > 0) && !hasCardsError && 
      <View
        dragState={dragState}
        filterState={filterState}
        numCardsRow={numCardsRow}
        cards={cards}
        imageMap={db.imageMap}
        handleCardPointerUp={handleCardPointerUp}/>
    }
    {(!hasCardsError) && (cardsLoaded) && (db.totalCards === 0) &&
      <div id="no_cards_screen" style={{
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
    {(hasCardsError) &&
      <div id="error_screen" style={{
        width:'100vw',
        height: '100vh',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontSize:'48px',
        fontWeight:'bold',
      }}>
        <h1> Error With Search! </h1>
      </div>
    }
    {(!cardsLoaded) &&
      <div id="loading_screen" style={{
        width:'100vw',
        height: '100vh',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        fontSize:'48px',
        fontWeight:'bold',
      }}>
        <h1> Loading Cards... </h1>
      </div>
    }
    {(cardsLoaded) &&
      <div id="countTracker" style={{
        position:"fixed",
        height:'30px',
        width:'fit-content',
        padding:'5px',
        backgroundColor:'rgba(0,0,0,0.5)',
        border:'1px solid rgba(255,255,255,0.5)',
        borderRadius:'5px',
        top:'calc(100vh - 30px)',
        left:'5px',
        zIndex:30,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        pointerEvents:'none',
      }}>
        <h3>{db.totalCards} cards found, {db.cards.length} shown</h3>
      </div>
    }
    <div id="scrollTrigger" ref={scrollTrigger} style={{
      width:"100%",
      height:"1px",
      display:"hidden",
    }}/>
  </div>)
};

export default CardDisplay;