'use client'

import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { _magicCard, MagicCard, } from "./types/default";
import useSelection from "@/hooks/magic/useSelection";
import CardView from "./card/CardView";
import { _wpoint } from "@/helpers/wpoint";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import Filter from "./filter/Filter";
import { MagicResources } from "@/hooks/magic/useMagicResources";
import useMagicCards from "@/hooks/magic/useMagicCards";
import { constructSearchQuery, constructScryfallUrl } from "@/helpers/magic/scryfallUrl";
import { ModalProvider } from "../general/ModalProvider";
import { isError } from "./types/werror";

export enum FilterState {
  HIDDEN = 'hidden',
  MOUSEDOVER = 'mousedover',
  REDUCED = 'reduced',
  WHOLE = 'whole',
};

type Props = {
  resources:MagicResources,
};
const SearchWindow:React.FC<Props> = ({
    resources,
  }) => {
  const {selected, updateSelected, handlers} = useSelection();
  const query = useMemo(() => constructSearchQuery(selected, resources), [selected, resources.sets]);
  const url = useMemo(() => constructScryfallUrl(query), [query]);
  const [displayLimit, setDisplayLimit] = useState<number>(50);
  const [error, loaded, allCards, fetchNextData, totalCards] = useMagicCards(url, displayLimit);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);
  const scrollTrigger = useRef<HTMLDivElement|null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<MagicCard>>>({});

  const cards = useMemo(() => allCards.map(c => overrides[c.oracleId] ? 
    { ...c, ...overrides[c.oracleId] } : c),
    [allCards, overrides]);

  useEffect(() => {
    console.log(overrides)
  }, [allCards, overrides]);

  const updateCardPrintId = useCallback((card: MagicCard, id: string) => {
    setOverrides(prev => ({ ...prev, [card.oracleId]: { ...prev[card.oracleId], printId: id } }));
  }, []);

  const updateCardReversed = useCallback((card: MagicCard, reversed: boolean) => {
    setOverrides(prev => ({
      ...prev,
      [card.oracleId]: { ...prev[card.oracleId], reversed },
    }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("q", query);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, [query]);
  /* ^^^^^
  * Add the inverse of this so that ppl can put in a search
  */

  useEffect(() => {
    console.log('cards changed!');
  }, [cards])

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

  const isFetchingRef = useRef(false);
/*
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
  }, [cards]);*/

  const hasError = useMemo(() => isError(error), [error]);

  return (
    <ModalProvider resources={resources} updateCardPrintId={updateCardPrintId} updateCardReversed={updateCardReversed} updateSelected={updateSelected}>
    <div
      onPointerDown={handlePointerDown}>
      <Filter
        state={filterState}
        setState={setFilterState}
        selected={selected}
        handlers={handlers}
        resources={resources}/>
      {(cards.length > 0) && !hasError && 
      <CardView
        paddingTop={(filterState === FilterState.REDUCED) ? '100px' : '10px'}
        dragState={dragState}
        numCardsRow={numCardsRow}
        updateCardReversed={updateCardReversed}
        cards={cards}/>}
      {(loaded) && (totalCards === 0) &&
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
      </div>}
      {(hasError) &&
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
      </div>}
      {(!loaded) &&
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
      </div>}
      {(loaded) &&
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
        <h3>{totalCards} cards found, {cards.length} shown</h3>
      </div>}
      <div id="scrollTrigger" ref={scrollTrigger} style={{
        width:"100%",
        height:"1px",
        display:"hidden",
      }}/>
    </div>
    </ModalProvider>);
};

export default SearchWindow;