'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";

type Card = {
  name:string,
}

type Set = {
  name:string,
  acronym:string,
}

async function fetchSets(url:string, fcb:(data:Set[])=>void) {
  let sets:Set[] = [];

  const response = await fetch(url);
  console.log('r', response);
  const json = await response.json();
  console.log('json', json);
  await addSets(json.search_uri);
  
  async function addSets(url:string) {
    sets = sets.concat(json.data.map((_piece:any) => (
      {
        name:_piece.name, acronym:_piece.code,
      })));
    console.log('data', json.data);
    console.log('sets', sets);
    if (json.has_more)
      await fetchSets(json.next_page, fcb);
  }

  fcb(sets);
}

async function fetchCards(url:string, fcb:(data:Card[])=>void) {
  let cards:Card[] = [];

  const response = await fetch(url);
  console.log('r', response);
  const json = await response.json();
  console.log('json', json);
  await addCards(json.search_uri);
  
  async function addCards(url:string) {
    const search = await fetch(url);
    const res = await search.json();
    console.log('res', res);
    cards = cards.concat(res.data);
    if (res.has_more)
      await addCards(res.next_page);
  }

  fcb(cards);
}

type Props = {};
export const Search:React.FC<Props> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [sets, setSets] = useState<Set[]>([]);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [numCardsPage, setNumCardsPage] = useState<number>(100);
  const [optionsShown, setOptionsShown] = useState<boolean>(false);
  const [optionsIntensity, setOptionsIntensity] = useState<number>(0);
  const [optionsDragging, setOptionsDragging] = useState<boolean>(false);
  const [optionsDragPoint, setOptionsDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [optionsDragLocation, setOptionsDragLocation] = useState<{x:number, y:number}>({x:0, y:0});

  useMouseLeavePage(() => {
    setOptionsDragging(false);
    setOptionsDragPoint({x:0, y:0});
    setOptionsDragLocation({x:0, y:0});
    setOptionsIntensity(0);
  });

  const fetchImages = async (cards:any[], cb:(images:any[])=>void) => {
    type Image = {
      name:string,
      url:string,
    }
    let images:Image[] = [];

    cards.forEach(async (_card, _index) => {
      fetch(_card.image_uris.small)
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
        .then((url) => {
          images.push({name:_card.name, url:url});
          console.log('adding');
          if (images.length === cards.length)
            cb(images);
        })
        .catch((err) => console.error(err))});
  };

  useEffect(() => {
    fetchSets('https://api.scryfall.com/sets/', (data) => {
      setSets(data);
    })
  }, []);

  /*
      {!loading &&
        <div style={{
          gridColumn: `1/${numCardsRow + 1}`,
          height: '30px',
          display:'flex',
          }}>
          <label>
            Cards Per Row: <input name="cardsPerRow" type="number" style={{
              width:'fit-content',
              backgroundColor:'white',
              textAlign:'center',
              }} defaultValue={numCardsRow} onChange={onChangeNumCardsRow} max={cards.length} min={1}/>
          </label>
        </div>
      }
  */

  useEffect(() => {
    fetchCards('https://api.scryfall.com/sets/aer', (data) => {
      setLoading(false);
      setCards(data);
      console.log('data', data);
      console.log('fetching images...');
      fetchImages(data, (_images) => {
        const newImageMap = new Map<string, string>();

        for(const [key, value] of imageMap)
          newImageMap.set(key, value);
console.log('_images', _images);
        _images.forEach((_image) => newImageMap.set(_image.name, _image.url));
console.log('imageMap', newImageMap);
        setImageMap(newImageMap);
        })});
  }, []);

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (isNaN(value)) return;

    setNumCardsRow(value);
  };

  const handleFiltersMouseDown:MouseEventHandler = (e) => {
    setOptionsDragging(true);
    setOptionsDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleMouseUp:MouseEventHandler = (e) => {
    const y = e.clientY;

    setOptionsDragging(false);
    setOptionsDragPoint({x:0, y:0});
    setOptionsDragLocation({x:0, y:0});

    if (((!optionsShown) && (optionsDragging) && (y >= 30)) ||
        ((optionsShown) && (!optionsDragging) && (y > 50)) ||
        ((optionsShown) && (optionsDragging) && (y <= 15)))
      setOptionsShown((_) => !_);
    
    if ((!optionsShown) && (optionsDragging) && (y < 30))
      setOptionsIntensity(Math.max(15 - y, 0));
    else
      setOptionsIntensity(0);
    (e.target as HTMLElement).style.cursor = "auto";
  };

  const handleMouseMove:MouseEventHandler = (e) => {
    const y = e.clientY;

    if (optionsDragging)
      setOptionsDragLocation({x:e.clientX - optionsDragPoint.x, y:y - optionsDragPoint.y});

    else if ((!optionsShown) && (y <= 15))
      setOptionsIntensity(15 - e.clientY);

    else
      setOptionsIntensity(0);
  };

  return (<div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
    {(!loading) && <>
      <div
        onMouseDown={handleFiltersMouseDown}
        style={{
        position:'fixed',
        top:(!optionsShown) ?
              `${-50 + optionsIntensity + optionsDragLocation.y}px` :
              `${optionsDragLocation.y}px`,
        width:'100%',
        border: '2px solid black',
        cursor:(optionsDragging) ? 'grabbing' :
               (!optionsShown) ?   'pointer' :
                                   'auto',
        borderRadius:'5px',
        height:'50px',
        boxShadow: `0px 0px ${optionsIntensity}px ${optionsIntensity}px rgba(146, 148, 248, 0.4)`,
        backgroundColor:'white',
        transition: (optionsDragging) ? "box-shadow 0.1s ease-in-out" :
                                        "box-shadow 0.1s ease-in-out, top 0.1s ease-in-out",
      }}>
      </div>
    </>}
    <div
      style={{
        cursor:(optionsDragging) ? 'grabbing' : 'auto',
        paddingTop:'50px',
        overflow:'scroll',
        minWidth:'100vw',
        width:'fit-content',
        paddingLeft:'15px',
        paddingRight:'15px',
        backgroundColor:'#E6DDC5',
        userSelect:(optionsDragging) ? 'none' : 'auto',
        color: 'black',
        display:'grid',
        gridTemplateColumns:`repeat(${numCardsRow}, 1fr)`,
      }}>
      {loading && <h4 style={{
        textAlign:'center',
        textAnchor:'middle',
      }}>Loading...</h4>}
      {!loading && cards.map((_card, _index)=>(
        <div key={_index} style={{
            padding:'10px',
            display:'flex',
            flexDirection:'column',
          }}>
          <h2 key={_index} style={{
            textAlign:'center',
            }}>{_card.name}</h2>
          <img src={imageMap.get(_card.name)} style={{
            maxWidth:'100%',
            marginTop:'auto',
          }}/>
        </div>
      ))}
    </div></div>
  )
};