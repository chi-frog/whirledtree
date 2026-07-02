'use client'

import { ChangeEventHandler, PointerEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { isCardDoublesided, MagicCard, MagicFormat, MagicSet, } from "./types/default";
import Filter from "./filters/Filter";
import Modal from "./Modal";
import { FilterUpdateFunction, Selected } from "@/hooks/magic/useFilters";
import View from "./View";
import { _wpoint } from "@/helpers/wpoint";
import { _dragState, DragStage, DragState, useDragContext } from "../general/DragProvider";
import { ErrorMap, LoadMap } from "@/hooks/magic/useMagicDatabase";
import { MagicSymbol } from "@/hooks/magic/useMagicSymbols";

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
  symbols:MagicSymbol[],
  symbolImageMap:Map<string, string>,
  databaseCards:MagicCard[],
  imageMap:ImageMap,
  hydrateLargeImage:(index:number)=>void,
  selected:Selected,
  updateSelected:FilterUpdateFunction,
  handlers:Record<keyof Selected, ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>
};
const CardDisplay:React.FC<Props> = ({
  errorMap, loadMap, formats, sets, symbols, symbolImageMap, databaseCards, imageMap, hydrateLargeImage,
  selected, updateSelected, handlers
}) => {
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(-1);
  const {subDrag, startDragging, dragStateRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);

  const [cards, setCards] = useState<MagicCard[]>(databaseCards);

  const changeCard = useCallback((index:number, card:MagicCard) =>
    setCards((prev) => prev.map((_card, _index) => (_index === index) ? card : _card)), []);

  useEffect(() => {
    setCards(databaseCards);
  } , [databaseCards]);

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
      setModalShown(true);
      setModalIndex(index);
      hydrateLargeImage(index);
    }
  }, [cards, imageMap]);

  const hasCardsError:boolean = useMemo(() => {
    const cardsError = errorMap.get('cards');
    return cardsError ? cardsError.length > 0 : true;
  }, [errorMap]);

  const cardsLoaded:boolean = useMemo(() => {
    const cardsLoaded = loadMap.get('cards');
    return cardsLoaded === true;
  }, [loadMap]);

  const modal = () => {
    if (!modalShown) return <></>;
    const card = cards[modalIndex];
    const frontImage = imageMap.get(card.name);
    const backImage = (card.back && isCardDoublesided(card)) ?
      imageMap.get(card.back.name) : imageMap.get("");

    return (
      <Modal
      close={()=>setModalShown(false)}
      symbols={symbols}
      symbolImageMap={symbolImageMap}
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

  return (
  <div
    onPointerDown={handlePointerDown}>
    <Filter
      setState={setFilterState}
      state={filterState}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selectedSet={selected.set} onChangeSet={handlers.set}
      selectedFormat={selected.format} onChangeFormat={handlers.format}
      selectedName={selected.name} onChangeName={handlers.name}
      selectedType={selected.type} onChangeType={handlers.type}
      sets={sets} cards={cards} formats={formats}/>
    {(cards.length > 0) && !hasCardsError && 
      <View loaded={loadMap.get('images')}
        dragState={dragState}
        filterState={filterState}
        numCardsRow={numCardsRow}
        cards={cards}
        changeCard={changeCard}
        imageMap={imageMap}
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