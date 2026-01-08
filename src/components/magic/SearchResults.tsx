'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, PointerEventHandler, useEffect, useRef, useState } from "react";
import { MagicCard, MagicFormat, } from "./types/default";
import useRefMap from "@/hooks/useRefMap";
import FiltersBar from "./filters/FiltersBar";
import { capitalize } from "@/helpers/string";
import useMagicSets from "@/hooks/magic/useMagicSets";
import Modal from "./Modal";
import { transformCard } from "./transforms/transformCard";
import useFilters from "@/hooks/magic/useFilters";
import View from "./View";
import { _dragState, DragState, useDragContext } from "@/app/page";
import { makeWPoint, subWPoints } from "@/helpers/wpoint";

const yCutoffHidden = 10;
const yCutoffWhole = 300;

async function fetchCards(url:string) {
  let cards:any[] = [];

  await addCards(url);
  
  async function addCards(url:string) {
    try {
      const search = await fetch(url);
      const res = await search.json();

      if (res.code !== Error.NOT_FOUND) {
        cards = cards.concat(res.data);

        if (res.has_more)
          await addCards(res.next_page);
      }
    } catch(e) {
      console.log('error', e);
    }
  }

  return cards;
}

export enum FilterState {
  HIDDEN = 'hidden',
  REDUCED = 'reduced',
  WHOLE = 'whole',
}

export enum Error {
  NO_ERROR = 'no_error',
  NOT_FOUND = 'not_found',

}

type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };

export type ImageMap = Map<string, ImagePacket>;


type Props = {};
export const SearchResults:React.FC<Props> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, ImagePacket>>(new Map());
  const [formats, setFormats] = useState<MagicFormat[]>([]);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const [filterGlow, setFilterGlow] = useState<number>(0);
  const startDragPoint = useRef<{x:number, y:number}>({x:0, y:0});
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [modalCard, setModalCard] = useState<MagicCard|null>(null);
  const [error, setError] = useState<Error>(Error.NO_ERROR);
  const {getMap, getRef} = useRefMap();
  const [setsLoaded, sets] = useMagicSets();
  const {url, selected, updateSelected, handlers} = useFilters();
  const [dragging, setDragging] = useState<boolean>(false);
  const draggingCard = useRef<number>(-1);
  const {subDrag, startDragging, dragStartPointRef, dragPointRef, dragVelocityRef} = useDragContext();
  const [dragState, setDragState] = useState<DragState>(_dragState);

  const onDragCards = (e:PointerEvent) => {
    window.scrollTo(window.scrollX + dragVelocityRef.current.x, window.scrollY - dragVelocityRef.current.y*2);
  }

  const onDragCardsStart = ({x, y}:PointerEvent) => {
    setDragging(true);
  }

  const onDragCardsEnd = (e:PointerEvent) => {
    setDragging(false);
  }

  useEffect(() => {
    subDrag({tag:'cards',
             onDragStart:onDragCardsStart,
             onDrag:onDragCards,
             onDragEnd:onDragCardsEnd})
  }, []);

  const onDragCardStart = ({x, y}:PointerEvent) => {
    setDragging(true);
  }

  const onDragCardEnd = (e:PointerEvent) => {
    draggingCard.current = -1;
    setDragging(false);
  }

  useEffect(() => {
    subDrag({tag:'card',
             onDragStart:onDragCardStart,
             onDragEnd:onDragCardEnd})
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-select", dragging);
  }, [dragging]);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const x = dragPointRef.current.x;
      const y = dragPointRef.current.y;
      setDragState({
        point:subWPoints(dragPointRef.current, dragStartPointRef.current),
        velocity:dragVelocityRef.current,
        angle:Math.atan2(dragVelocityRef.current.y, dragVelocityRef.current.x),
      });
      if (dragging)
        raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  useMouseLeavePage(() => {
    setFilterGlow(0);
  });

  const copyImageMap:(imageMap:ImageMap)=>ImageMap = (imageMap) => {
    const newImageMap = new Map<string, ImagePacket>();

    for (const [key, value] of imageMap)
      newImageMap.set(key, value);

    return newImageMap;
  };

  const fetchImage = async (hydratedImageMap:ImageMap, name:string, type:string, uri:string) => {
    const blob = await fetch(uri)
      .then((response) => {
        const reader = response.body?.getReader();

        if (!reader) {
          console.log('Reader error');
          return;
        }

        return new ReadableStream({
          start(controller) {
            return pump();
            
            async function pump():Promise<ReadableStream<any> | undefined> {
              return reader?.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        })})
      // Create a new response out of the stream
      .then((stream) => new Response(stream))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url) => url)
      .catch((err) => console.error(err));

    if (!blob) {
      console.log('Something wrong with blob');
      return;
    }

    let dryImagePacket = hydratedImageMap.get(name);

    if (!dryImagePacket) {
      dryImagePacket = {name:name};
    }

    let imagePacket = {...dryImagePacket};
    if (type === 'small') imagePacket.smallBlob = blob;
    else if (type === 'large') imagePacket.largeBlob = blob;
    else console.log('Unknown image type', type);
    hydratedImageMap.set(name, imagePacket);
  }



  const hydrateImageMap = async (imageMap:Map<string, ImagePacket>, cards:any[], type:string) => {
    let hydratedImageMap = copyImageMap(imageMap);
    
    await Promise.all(cards.map(async (_card, _index) => {
      const uri = (type === "small") ? _card.imageUris.small :
                  (type === "large") ? _card.imageUris.large :
                                       "";

      if (!uri) {
        console.log('Invalid Uri for ' + _card.name, uri);
        return Promise.resolve();
      }

      return fetchImage(hydratedImageMap, _card.name, type, uri);
    }));

    return hydratedImageMap;
  };

  const search = async () => {
    setLoading(true);

    let data = await fetchCards(url);

    if ((data.length <= 0) ||
        (!data[0])) {
      setError(Error.NOT_FOUND);
      setCards([]);
      return;
    }

    let cards = data.filter((_card, _index) => data.findIndex((__card) => __card.name === _card.name) === _index);

    cards = cards.map(transformCard);

    setCards(cards);
    setLoading(false);
    setError(Error.NO_ERROR);

    // Do something if no cards

    if (formats.length === 0)
      setFormats([
        {name:"Any"},
        ...Object.getOwnPropertyNames(cards[0].legalities).map((_format) => ({name:capitalize(_format)}))]);

    const hydratedImageMap = await hydrateImageMap(imageMap, cards, "small");
      
    setImageMap(hydratedImageMap);
  }

  useEffect(() => {
    search();
  }, [selected]);

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (isNaN(value)) return;

    setNumCardsRow(value);
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
    startDragging(e, 'cards');
  };

  const handlePointerMove:PointerEventHandler = (e) => {
    if (modalShown) return;

    resetFilterGlow(filterState, e.clientY)
  };

  const handlePointerUp:PointerEventHandler = (e) => {
  };

  const handleCardPointerDown = (e:React.PointerEvent, index:number) => {
    e.stopPropagation();

    startDragging(e, 'card');
    setDragState({
      point:subWPoints(dragPointRef.current, dragStartPointRef.current),
      velocity:dragVelocityRef.current,
      angle:0,
    });
    draggingCard.current = index;
  };

  const handleCardPointerUp = async (e:React.PointerEvent, index:number) => {
    e.stopPropagation();

    if ((e.clientX === startDragPoint.current.x) && (e.clientY === startDragPoint.current.y)) {
      setModalShown(true);
      setModalCard(cards[index]);
      const hydratedImageMap = await hydrateImageMap(imageMap, [cards[index]], "large");
      
      setImageMap(hydratedImageMap);
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

  const handleCardPointerEnter = (e:React.PointerEvent, index:number) => {
    if (dragging)
      return;

    const element = getMap().get(index);
    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;

    element.style.border = "1px solid rgb(146, 148, 248)";
    element.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    if (!dragging)
      element.style.top = "-3px";

    setTimeout(() => {
      const change = () => {
        if (element.style.boxShadow === 'none')
          return;

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
        element.style.boxShadow = `0px 0px 10px 3px rgba(146, 148, 248, ${opacity})`;

        setTimeout(change, 10);
      };

      change();
    }, 10);
  };

  const handleCardPointerLeave = (e:React.PointerEvent, index:number) => {
    const element = getMap().get(index);

    element.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    element.style.boxShadow = "none";
    element.style.position = "auto";
    element.style.top = "";

  };

  const filterHidden = (filterState === FilterState.HIDDEN);

  return (
  <div
    onPointerUp={handlePointerUp}
    onPointerMove={handlePointerMove}
    onPointerDown={(e)=>handlePointerDown(e)}>
    <FiltersBar
      handleArrowPointerDown={handleFilterArrowPointerDown} handleArrowPointerUp={handleFilterArrowPointerUp}
      handlePointerDown={handleFilterPointerDown} handlePointerUp={handleFilterPointerUp}
      state={filterState} glow={filterGlow}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selectedSet={selected.set} onChangeSet={handlers.set}
      selectedFormat={selected.format} onChangeFormat={handlers.format}
      selectedName={selected.name} onChangeName={handlers.name}
      sets={sets} cards={cards} formats={formats}/>
    {error === Error.NO_ERROR && 
      <View loading={loading} getRef={getRef}
        dragging={dragging}
        dragState={dragState}
        filterHidden={filterHidden}
        yCutoffHidden={yCutoffHidden}
        numCardsRow={numCardsRow}
        cards={cards}
        draggingCardIndex={draggingCard.current}
        imageMap={imageMap}
        handleCardPointerEnter={handleCardPointerEnter}
        handleCardPointerLeave={handleCardPointerLeave}
        handleCardPointerDown={handleCardPointerDown}
        handleCardPointerUp={handleCardPointerUp}/>
    }
    {error === Error.NOT_FOUND &&
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
      imageBlob={modalCard ?
                 imageMap.get(modalCard.name)?.largeBlob ? 
                 imageMap.get(modalCard.name)?.largeBlob : 
                 imageMap.get(modalCard.name)?.smallBlob :
                 undefined}/>}
  </div>)
};