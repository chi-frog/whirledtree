'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { isCardDoublesided, MagicCard, MagicFormat, MagicSet, } from "./types/default";
import useRefMap from "@/hooks/useRefMap";
import Filter from "./filters/Filter";
import Modal from "./Modal";
import useFilters from "@/hooks/magic/useFilters";
import View from "./View";
import { _wpoint } from "@/helpers/wpoint";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import useCardDrag from "@/hooks/useCardDrag";
import { ErrorMap, LoadMap } from "@/hooks/magic/useMagicDatabase";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";

const yCutoffHidden = 10;

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
  errorMap:ErrorMap,
  loadMap:LoadMap,
  formats:MagicFormat[],
  sets:MagicSet[],
  databaseCards:MagicCard[],
  imageMap:ImageMap,
  hydrateLargeImage:(index:number)=>void,
};
const CardDisplay:React.FC<Props> = ({
  errorMap, loadMap, formats, sets, databaseCards, imageMap, hydrateLargeImage
}) => {
  const {selected, updateSelected, handlers} = useFilters();
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const [filterGlow, setFilterGlow] = useState<number>(0);
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(-1);
  const {getMap, getRef} = useRefMap();
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);
  const [draggingCardIndex, cardDragMap, startDraggingCard] = useCardDrag(subDrag, startDragging, dragStateRef);

  const url = useMemo(() =>
    constructSearchUrl(selected),
    [selected]);

  const [cards, setCards] = useState<MagicCard[]>(databaseCards);

  const changeCard = (index:number, card:MagicCard) =>
    setCards(cards.map((_card, _index) => (_index === index) ? card : _card));

  useEffect(() => setCards(databaseCards), [databaseCards]);

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

  useMouseLeavePage(() => {
    setFilterGlow(0);
  });

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (!isNaN(value)) setNumCardsRow(value);
  };


  const resetFilterGlow = (filterState:FilterState, y:number) => {
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

    if ((e.button !== 2) &&
        (e.clientX === dragState.start.x) &&
        (e.clientY === dragState.start.y)) {
      setModalShown(true);
      setModalIndex(index);
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

  const hasCardsError:boolean = useMemo(() => {
    const cardsError = errorMap.get('cards');
    return cardsError ? cardsError.length > 0 : true;
  }, [errorMap]);

  const cardsLoaded:boolean = useMemo(() => {
    const cardsLoaded = loadMap.get('cards');
    console.log('loadMap', loadMap);
    return cardsLoaded === true;
  }, [loadMap]);

  console.log('cardsLoaded', cardsLoaded);

  const modal = () => {
    if (!modalShown) return <></>;
    const card = cards[modalIndex];
    const frontImage = imageMap.get(card.name);
    const backImage = (card.back && isCardDoublesided(card)) ?
      imageMap.get(card.back.name) : null;

    return (
      <Modal
      close={()=>setModalShown(false)}
      cards={cards}
      changeCard={changeCard}
      updateSelected={updateSelected}
      index={modalIndex}
      imagePackets={(!frontImage) ? [] :
                    (backImage)   ? [frontImage, backImage] :
                                    [frontImage]}
      />
    );
  };

  if (cards.length === 0) {
    console.log('e', errorMap);
    console.log('l', loadMap);
    console.log('cd', databaseCards);
    console.log('c', cards);
  }

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
    {(cards.length > 0) && !hasCardsError && 
      <View loaded={loadMap.get('images')} getRef={getRef}
        dragState={dragState}
        cardDragMap={cardDragMap}
        filterState={filterState}
        yCutoffHidden={yCutoffHidden}
        numCardsRow={numCardsRow}
        cards={cards}
        changeCard={changeCard}
        imageMap={imageMap}
        handleCardPointerDown={handleCardPointerDown}
        handleCardPointerUp={handleCardPointerUp}/>
    }
    {(cards.length === 0) && (!hasCardsError) && (cardsLoaded) &&
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
      <div id="error_screen" style={{
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
    {modal()}
  </div>)
};

export default CardDisplay;