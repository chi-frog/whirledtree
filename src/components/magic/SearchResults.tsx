'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";
import { MagicCard, MagicFormat, MagicSet } from "./types/default";
import useRefMap from "@/hooks/useRefMap";
import FiltersBar from "./filters/FiltersBar";
import { capitalize } from "@/helpers/string";

async function fetchSets(fcb:(data:MagicSet[])=>void) {
  const url = scryfallUrl + urlSets;
  let sets:MagicSet[] = [];

  await chunk(url);
  
  async function chunk(url:string) {
    const response = await fetch(url);
    const json = await response.json();
    addSets(json.data);

    async function addSets(data:any) {
      sets = sets.concat(data.map((_set:any) => (
        {
          name:_set.name, acronym:_set.code,
        })));

      if (json.has_more)
        await chunk(json.next_page);
    }
  }

  fcb(sets);
}

async function fetchCards(url:string, fcb:(data:MagicCard[])=>void) {
  let cards:MagicCard[] = [];
  console.log('searching url ' + url);

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

const scryfallUrl = 'https://api.scryfall.com/';
const urlSets = 'sets/';
const urlCards= 'cards/';
const urlSearch = 'search?q=';
const urlSearchFormat = 'f:';
const urlSearchSet = 's:';

export enum FilterState {
  HIDDEN = 'hidden',
  HIDDEN_DRAGGING = 'hidden_dragging',
  REDUCED = 'reduced',
  REDUCED_DRAGGING = 'reduced_dragging',
  WHOLE = 'whole',
}

type Props = {};
export const SearchResults:React.FC<Props> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [sets, setSets] = useState<MagicSet[]>([]);
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
  const {getMap, getRef} = useRefMap();

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

  const fetchImages = async (cards:any[], cb:(image:any)=>void) => {
    cards.forEach(async (_card, _index) => {
      let imageUri = _card.image_uris?.small;

      if (!imageUri) {
        console.log('Doesnt Exist', _card);
        imageUri = _card.card_faces[0].image_uris.small;
      }
      fetch(imageUri)
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
        // Update image
        .then((url) => {  //Need to count requests/responses in case there is an error
          //images.push({name:_card.name, url:url});
          //if (images.length === cards.length)
            //cb(images);
          cb({name:_card.name, url:url});
        })
        .catch((err) => console.error(err))});
  };

  useEffect(() => {
    fetchSets((data) => {
      setSets(data);

    })
  }, []);

  useEffect(() => {
    setLoading(true);

    let url = scryfallUrl + urlCards + urlSearch;

    if (selectedSets[0] !== "All") {
      url += urlSearchSet + selectedSets[0];
    }
    if (selectedFormats[0] !== "All") {
      if (selectedSets[0] !== "All")
        url += "+";
      url += urlSearchFormat + selectedFormats[0];
    }

    fetchCards(url, (data) => {
      const cards = data.filter((_card, _index) => data.findIndex((__card) => __card.name === _card.name) === _index);

      setLoading(false);
      setCards(cards);

      // Do something if no cards

      if (formats.length === 0)
        setFormats([
          {name:"All"},
          ...Object.getOwnPropertyNames(cards[0].legalities).map((_format) => ({name:capitalize(_format)}))]);

      fetchImages(cards, (_image) => {
        const newImageMap = new Map<string, string>();

        for(const [key, value] of imageMap)
          newImageMap.set(key, value);

        newImageMap.set(_image.name, _image.url);

        setImageMap((_imageMap) => {
          const newImageMap = new Map<string, string>();

          for(const [key, value] of _imageMap)
            newImageMap.set(key, value);

          newImageMap.set(_image.name, _image.url);
          return newImageMap;
        });
        })});
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

  const handleFiltersMouseDown:MouseEventHandler = (e) => {
    if (filterState === FilterState.HIDDEN)
      setFilterState(FilterState.HIDDEN_DRAGGING);
    else if (filterState === FilterState.REDUCED)
      setFilterState(FilterState.REDUCED_DRAGGING);
    setFilterDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleMouseUp:MouseEventHandler = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if ((e.target as HTMLElement).tagName === "OPTION")
      return;

    setDragging(false);
    setDragPoint({x:0, y:0});
    setFilterDragPoint({x:0, y:0});
    setFilterDragLocation({x:0, y:0});

    let newFilterState = filterState;

    if ((filterDragging) && (filterDragPoint.x === x) && (filterDragPoint.y === y)) {
      if (filterReduced)
        newFilterState = FilterState.HIDDEN;
      else if (filterHidden)
        newFilterState = FilterState.REDUCED;
    } else if ((filterState === FilterState.HIDDEN_DRAGGING) && (y >= 30))
      newFilterState = FilterState.REDUCED;
    else if ((filterReduced) && (y <= 15))
      newFilterState = FilterState.HIDDEN;
    else if (filterState === FilterState.HIDDEN_DRAGGING)
      newFilterState = FilterState.HIDDEN;
    else if (filterState === FilterState.REDUCED_DRAGGING)
      newFilterState = FilterState.REDUCED;

    setFilterState(newFilterState);
    
    setFilterGlow((newFilterState === FilterState.HIDDEN) ? Math.max(15 - y, 0) :
                                   (y <= 15) ? 5 : 0);
  };

  const handleMouseMove:MouseEventHandler = (e) => {
    const y = e.clientY;

    if (filterDragging) {
      setFilterDragLocation({x:e.clientX - filterDragPoint.x, y:y - filterDragPoint.y});

    } else if (dragging) {
      window.scrollTo(window.scrollX + dragPoint.x - e.clientX, window.scrollY + dragPoint.y - e.clientY);
      setDragPoint({x:e.clientX, y:e.clientY});

    }

    setFilterGlow((filterState === FilterState.HIDDEN) ?
                          (Math.max(15 - y, 0)) :
                          (y <= 15) ? 5 : 0);
  };

  const handleMouseDown:MouseEventHandler = (e) => {
    setDragging(true);
    setDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleCardMouseDown = (e:React.MouseEvent, index:number) => {
    e.stopPropagation();
    console.log('card', cards[index]);
    console.log('image', imageMap.get(cards[index].name));
    console.log('imageMap', imageMap);
  };

  const handleCardMouseEnter = (e:React.MouseEvent, index:number) => {
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

  const filterDragging = (filterState === FilterState.REDUCED_DRAGGING) ||
                         (filterState === FilterState.HIDDEN_DRAGGING);
  const filterHidden = (filterState === FilterState.HIDDEN) ||
                       (filterState === FilterState.HIDDEN_DRAGGING);
  const filterReduced = (filterState === FilterState.REDUCED) ||
                        (filterState === FilterState.REDUCED_DRAGGING);

  return (<div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
    <FiltersBar handleFiltersMouseDown={handleFiltersMouseDown}
      state={filterState} dragPoint={filterDragPoint} dragLocation={filterDragLocation} glow={filterGlow}
      numCardsRow={numCardsRow} onChangeNumCardsRow={onChangeNumCardsRow}
      selectedSets={selectedSets} onChangeSet={onChangeSet}
      selectedFormats={selectedFormats} onChangeFormat={onChangeFormat}
      sets={sets} cards={cards} formats={formats}/>
    <div
      style={{
        cursor:(filterDragging || dragging) ? 'grabbing' : 'move',
        paddingTop:`${(filterHidden) ? Math.min(15 + filterDragLocation.y, 50) : 50}px`,
        overflow:'scroll',
        minWidth:'100vw',
        minHeight:'100vh',
        width:'fit-content',
        paddingLeft:'15px',
        paddingRight:'15px',
        backgroundColor:'black',
        userSelect:(filterDragging || dragging) ? 'none' : 'auto',
        transition:(filterDragging) ? "" : 'padding 0.1s ease-in-out',
        color: 'black',
        display:'grid',
        gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {loading && <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
      }}>Loading...</h4>}
      {!loading && cards.map((_card, _index)=>(
        <div
          key={_index} ref={getRef.bind(null, _index)}
          onMouseEnter={(e)=>handleCardMouseEnter(e, _index)}
          onMouseLeave={(e)=>handleCardMouseLeave(e, _index)}
          onMouseDown={(e) => handleCardMouseDown(e, _index)} style={{
            display:'flex',
            cursor:(filterDragging || dragging) ? 'grabbing' : 'hand',
            flexDirection:'column',
            margin:'5px',
            overflow:'hidden',
            borderRadius:'12px',
            border:'1px solid rgba(255, 255, 255, 0.7)',
            transition:'top 0.3s ease-in-out',
            minWidth:'100px',
            height:'fit-content'}}>
          {/*<h2 key={_index} onMouseDown={handleCardNameMouseDown} style={{
            textAlign:'center',
            margin:'3px',
            cursor:(optionsDragging || dragging) ? 'grabbing' : 'text',
            }}>{_card.name}</h2>*/}
          <img src={imageMap.get(_card.name)} draggable="false" style={{
            maxWidth:'100%',
            cursor:(filterDragging || dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
          }}/>
        </div>
      ))}
    </div></div>
  )
};