'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";
import { MagicCard, MagicFormat, MagicSet } from "./types/default";
import useRefMap from "@/hooks/useRefMap";
import FiltersBar from "./filters/FiltersBar";
import { capitalize } from "@/helpers/string";
import useMagicSets from "@/hooks/magic/useMagicSets";
import Modal from "./Modal";
import { constructSearchUrl } from "@/helpers/magic/scryfallUrl";

const yCutoffHidden = 10;
const yCutoffWhole = 300;

async function fetchCards(url:string, fcb:(data:any[])=>void) {
  let cards:any[] = [];

  await addCards(url);
  
  async function addCards(url:string) {
    const search = await fetch(url);
    const res = await search.json();

    cards = cards.concat(res.data);

    if (res.has_more)
      await addCards(res.next_page);
  }

  fcb(cards);
}

export enum FilterState {
  HIDDEN = 'hidden',
  HIDDEN_PRESSED = 'hidden_pressed',
  HIDDEN_DRAGGING = 'hidden_dragging',
  REDUCED = 'reduced',
  REDUCED_PRESSED = 'reduced_pressed',
  REDUCED_DRAGGING = 'reduced_dragging',
  WHOLE = 'whole',
  WHOLE_PRESSED = 'whole_pressed',
}

type Props = {};
export const SearchResults:React.FC<Props> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, ImagePacket>>(new Map());
  const [selectedSets, setSelectedSets] = useState<string[]>(['aer']);
  const [formats, setFormats] = useState<MagicFormat[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['All']);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [filterState, setFilterState] = useState<FilterState>(FilterState.HIDDEN);
  const [filterGlow, setFilterGlow] = useState<number>(0);
  const [filterDragPoint, setFilterDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [filterDragLocation, setFilterDragLocation] = useState<{x:number, y:number}>({x:0, y:0});
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragPoint, setDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [cardDragPoint, setCardDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [modalCard, setModalCard] = useState<MagicCard|null>(null);
  const {getMap, getRef} = useRefMap();
  const [setsLoaded, sets] = useMagicSets();

  const setFilterDefaultDrag = () => {
    if (filterState === FilterState.HIDDEN_DRAGGING)
      setFilterState(FilterState.HIDDEN);
    else if (filterState === FilterState.REDUCED_DRAGGING)
      setFilterState(FilterState.REDUCED_DRAGGING);
  };

  useMouseLeavePage(() => {
    setFilterDefaultDrag();
    setFilterDragPoint({x:0, y:0});
    setFilterDragLocation({x:0, y:0});
    setFilterGlow(0);
  });

  type ImagePacket = {
    name:string,
    smallBlob?:string,
    largeBlob?:string,
  };

  type ImageMap = Map<string, ImagePacket>;

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

  useEffect(() => {
    setLoading(true);

    let url = constructSearchUrl(selectedSets, selectedFormats);

    fetchCards(url, async (data) => {
      let cards = data.filter((_card, _index) => data.findIndex((__card) => __card.name === _card.name) === _index);

      setLoading(false);

      const transformCard:(card:any)=>MagicCard = (card:any) => {
        return {
          name:card.name,
          doubledfaced:true && (card.card_faces),
          legalities:card.legalities,
          imageUris:{
            small:card.image_uris.small,
            large:card.image_uris.large,
          }
        }
      }

      cards = cards.map(transformCard);

      setCards(cards);

      // Do something if no cards

      if (formats.length === 0)
        setFormats([
          {name:"All"},
          ...Object.getOwnPropertyNames(cards[0].legalities).map((_format) => ({name:capitalize(_format)}))]);

      const hydratedImageMap = await hydrateImageMap(imageMap, cards, "small");
      
      setImageMap(hydratedImageMap);
    });
  }, [selectedSets, selectedFormats]);

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (isNaN(value)) return;

    setNumCardsRow(value);
  };

  const onChangeSet:ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedSets([e.target.value]);
  };

  const onChangeFormat:ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSelectedFormats([e.target.value]);
  }

  const resetFilterGlow = (filterState:FilterState, y:number) => {
    setFilterGlow((filterState === FilterState.HIDDEN && y <= yCutoffHidden)  ? 10 :
                  (y <= yCutoffHidden)                                        ? -3 :
                  (filterState === FilterState.REDUCED && y > 50 && y <= 80) ? 10 :
                                                                                0);
  }

  const changeFilterState = (filterState:FilterState, y:number) => {
    resetFilterGlow(filterState, y);
    setFilterState(filterState);
  };

  const handleFilterArrowMouseDown:MouseEventHandler = (e) => {
    console.log('amd', filterState);
    if (filterState === FilterState.WHOLE)
      setFilterState(FilterState.WHOLE_PRESSED);
    if (filterState === FilterState.REDUCED)
      setFilterState(FilterState.REDUCED_PRESSED);
    if (filterState === FilterState.HIDDEN)
      setFilterState(FilterState.HIDDEN_PRESSED);

    e.stopPropagation();
  };

  const handleFilterArrowMouseUp:MouseEventHandler = (e) => {
    console.log('amu', filterState);
    if (filterState === FilterState.WHOLE_PRESSED)
      setFilterState(FilterState.REDUCED);
    if (filterState === FilterState.REDUCED_PRESSED)
      changeFilterState(FilterState.WHOLE, e.clientY);
    if (filterState === FilterState.HIDDEN_PRESSED)
      setFilterState(FilterState.REDUCED);
    e.stopPropagation();
  };

  const handleFilterMouseDown:MouseEventHandler = (e) => {
    console.log('fmd', filterState);
    const y = e.clientY;

    switch(filterState) {
    case FilterState.HIDDEN:
      setFilterState(FilterState.HIDDEN_PRESSED);
      break;
    case FilterState.REDUCED:
      setFilterState(FilterState.REDUCED_PRESSED);
      break;
    case FilterState.WHOLE:
      handleMouseDown(e);
      setFilterState(FilterState.WHOLE_PRESSED);
      break;
    default: console.log('Error with filterState', filterState);
    }

    setFilterDragPoint({x:e.clientX, y:e.clientY});
    e.stopPropagation();
  };

  const handleMouseDown:MouseEventHandler = (e) => {
    console.log('md', filterState);
    setDragging(true);
    setDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleCardMouseDown = (e:React.MouseEvent, index:number) => {
    e.stopPropagation();

    setCardDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleCardMouseUp = async (e:React.MouseEvent, index:number) => {
    e.stopPropagation();

    console.log('card', cards[index]);
    setCardDragPoint({x:0, y:0});

    if (e.clientX === cardDragPoint.x && (e.clientY === cardDragPoint.y)) {
      setModalShown(true);
      setModalCard(cards[index]);
      const hydratedImageMap = await hydrateImageMap(imageMap, [cards[index]], "large");
      
      setImageMap(hydratedImageMap);
    }
  };

  const handleMouseMove:MouseEventHandler = (e) => {
    console.log('mm', filterState);
    const y = e.clientY;

    const newFilterState = 
      (filterState === FilterState.HIDDEN_PRESSED)  ? FilterState.HIDDEN_DRAGGING :
      (filterState === FilterState.REDUCED_PRESSED) ? FilterState.REDUCED_DRAGGING :
      (filterState === FilterState.WHOLE_PRESSED)   ? FilterState.WHOLE :
                                                      filterState;

    if (filterDragging(newFilterState)) {
      setFilterDragLocation({x:e.clientX - filterDragPoint.x, y:y - filterDragPoint.y});

    } else if (dragging) {
      window.scrollTo(window.scrollX + dragPoint.x - e.clientX, window.scrollY + dragPoint.y - e.clientY);
      setDragPoint({x:e.clientX, y:e.clientY});
    }

    changeFilterState(newFilterState, y);
  };

  const handleFilterMouseUp:MouseEventHandler = (e) => {
    console.log('fmu', filterState);
    const y = e.clientY;

    setFilterDragLocation({x:0, y:0});

    if (filterState === FilterState.HIDDEN_PRESSED) {
      changeFilterState(FilterState.REDUCED, y);

    } else if (filterState === FilterState.REDUCED_PRESSED) {
      if (y <= yCutoffHidden)
        changeFilterState(FilterState.HIDDEN, y);
      else
        changeFilterState(FilterState.REDUCED, y);
      
    } else if (filterState === FilterState.HIDDEN_DRAGGING) {
      if (y > yCutoffHidden && y <= yCutoffWhole) {
        changeFilterState(FilterState.REDUCED, y);
      } else if (y > yCutoffWhole)
        changeFilterState(FilterState.WHOLE, y);
      else
        changeFilterState(FilterState.HIDDEN, y);
    } else if (filterState === FilterState.REDUCED_DRAGGING) {
      if (y <= yCutoffHidden) {
        changeFilterState(FilterState.HIDDEN, y);
      } else if (y > yCutoffWhole)
        changeFilterState(FilterState.WHOLE, y);
      else
        changeFilterState(FilterState.REDUCED, y);
    } else if (filterWhole) {
      handleMouseUp(e);
    }

    e.stopPropagation();
  };

  const handleMouseUp:MouseEventHandler = (e) => {
    console.log('mu', filterState);
    const x = e.clientX;
    const y = e.clientY;

    if ((e.target as HTMLElement).tagName === "OPTION")
      return;

    setDragging(false);
    setDragPoint({x:0, y:0});
    setFilterDragPoint({x:0, y:0});
    setFilterDragLocation({x:0, y:0});

    let newFilterState = filterState;;
    if (filterState === FilterState.HIDDEN_DRAGGING) {
      newFilterState = (y >= yCutoffHidden) ? FilterState.REDUCED :
                                              FilterState.HIDDEN;
    } else if (filterState === FilterState.REDUCED_DRAGGING) {
      newFilterState = (y <= yCutoffHidden) ? FilterState.HIDDEN :
                       (y > yCutoffWhole)  ? FilterState.WHOLE :
                                             filterState;
    } else if (filterWhole) {
      newFilterState = (y <= yCutoffHidden) ? FilterState.HIDDEN :
                       (y <= 50)            ? FilterState.REDUCED :
                                              FilterState.WHOLE;
    } else
      console.log('FilterState not changed', filterState);
    
    changeFilterState(newFilterState, y);
  };

  const handleCardMouseEnter = (e:React.MouseEvent, index:number) => {
    if (dragging || filterDragging(filterState))
      return;

    const element = getMap().get(index);
    let opacity = 0;
    let opacityGoingUp = true;
    let opacityFirstPass = true;
    let opacityRate = 0.008;

    element.style.border = "1px solid rgb(146, 148, 248)";
    element.style.boxShadow = `0px 0px 10px 4px rgba(146, 148, 248, ${opacity})`;
    element.style.position = "relative";
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

  const handleCardMouseLeave = (e:React.MouseEvent, index:number) => {
    const element = getMap().get(index);

    element.style.border = '1px solid rgba(255, 255, 255, 0.7)',
    element.style.boxShadow = "none";
    element.style.position = "auto";
    element.style.top = "";

  };

  const filterDragging = (filterState:FilterState) => (filterState === FilterState.REDUCED_DRAGGING) ||
                                                      (filterState === FilterState.HIDDEN_DRAGGING);
  const filterHidden = (filterState === FilterState.HIDDEN) ||
                       (filterState === FilterState.HIDDEN_PRESSED) ||
                       (filterState === FilterState.HIDDEN_DRAGGING);
  const filterReduced = (filterState === FilterState.REDUCED) ||
                        (filterState === FilterState.REDUCED_PRESSED) ||
                        (filterState === FilterState.REDUCED_DRAGGING);
  const filterWhole = (filterState === FilterState.WHOLE) ||
                      (filterState === FilterState.WHOLE_PRESSED);      

  return (
  <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
    <FiltersBar yCutoffHidden={yCutoffHidden}
      handleArrowMouseDown={handleFilterArrowMouseDown} handleArrowMouseUp={handleFilterArrowMouseUp}
      handleMouseDown={handleFilterMouseDown} handleMouseUp={handleFilterMouseUp}
      state={filterState} dragPoint={filterDragPoint} dragLocation={filterDragLocation} glow={filterGlow}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selectedSets={selectedSets} onChangeSet={onChangeSet}
      selectedFormats={selectedFormats} onChangeFormat={onChangeFormat}
      sets={sets} cards={cards} formats={formats}/>
    <div className="hover:bg-blue" style={{
      cursor:(filterDragging(filterState) || dragging) ? 'grabbing' : 'move',
      paddingTop:`${(filterHidden) ? Math.min(yCutoffHidden + filterDragLocation.y, 80) : 80}px`,
      overflow:'scroll',
      minWidth:'100vw',
      minHeight:'100vh',
      width:'fit-content',
      paddingLeft:'15px',
      paddingRight:'15px',
      backgroundColor:'black',
      userSelect:(filterDragging(filterState) || dragging) ? 'none' : 'auto',
      transition:(filterDragging(filterState)) ? "" : 'padding 0.1s ease-in-out',
      color: 'black',
      display:'grid',
      gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {loading &&
      <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
        }}>Loading...</h4>}
      {!loading &&
      cards.map((_card, _index)=>(
        <div key={_index} ref={getRef.bind(null, _index)}
          onMouseEnter={(e)=>handleCardMouseEnter(e, _index)}
          onMouseLeave={(e)=>handleCardMouseLeave(e, _index)}
          onMouseDown={(e) => handleCardMouseDown(e, _index)}
          onMouseUp={(e) => handleCardMouseUp(e, _index)} style={{
            display:'flex',
            cursor:(filterDragging(filterState) || dragging) ? 'grabbing' : 'hand',
            flexDirection:'column',
            margin:'5px',
            overflow:'hidden',
            borderRadius:'12px',
            border:'1px solid rgba(255, 255, 255, 0.7)',
            transition:'top 0.3s ease-in-out',
            minWidth:'100px',
            height:'fit-content'
            }}>
          <img src={imageMap.get(_card.name)?.smallBlob} draggable="false" style={{
            maxWidth:'100%',
            cursor:(filterDragging(filterState) || dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
           }}/>
        </div>
      ))}
    </div>
    <div id="whole_shadow" className="w-screen h-screen" style={{
        background: 'transparent',
        position:'fixed',
        top:'0px',
        pointerEvents:'none',
        boxShadow:(filterDragging(filterState) && filterDragLocation.y > yCutoffWhole) ?
          'inset 0px 0px 15px 15px rgba(146, 148, 248, 0.7)' : '',
        transition: 'box-shadow 0.1s ease-in-out'
      }} />
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