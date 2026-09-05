'use client'

import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { _magicCard, MagicCard } from "./types/default";
import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import View from "./View";
import { _wpoint } from "@/helpers/wpoint";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import { MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import NewFilter from "./filters/NewFilter";

export enum FilterState {
  HIDDEN = 'hidden',
  MOUSEDOVER = 'mousedover',
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

  const changeCard = useCallback((index:number, card:MagicCard) =>
    setCards((prev) => prev.map((_card, _index) => (_index === index) ? card : _card)), []);

  useEffect(() => {
    setCards(db.cards);
  } , [db.cards]);

  const dragging = useMemo(() => dragState.stage === DragStage.ACTIVE, [dragState.stage]);

  const onDragView = () => {
    window.scrollTo(window.scrollX + dragStateRef.current.delta.x, window.scrollY - dragStateRef.current.delta.y*2);
  }

  const onDragViewStart = () => {
    setDragState({...dragStateRef.current});
  }

  const onDragViewEnd = () => {
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

    if ((!db.totalCards) ||
        (db.totalCards <= cards.length))
      return;

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

  /*
  <Filter
      setState={setFilterState}
      state={filterState}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selected={selected} handlers={handlers}
      sets={db.sets} maxCards={cards.length} formats={db.formats} types={db.types}/>
      */

  return (
  <div
    onPointerDown={handlePointerDown}>
    <NewFilter
      state={filterState}
      setState={setFilterState}
      selected={selected}
      handlers={handlers}
      />
    {(cards.length > 0) && !hasCardsError && 
      <View
        paddingTop={(filterState === FilterState.REDUCED) ? '100px' : '10px'}
        dragState={dragState}
        numCardsRow={numCardsRow}
        cards={cards}/>
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