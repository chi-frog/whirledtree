'use client'

import useMouseLeavePage from "@/hooks/useMouseLeavePage";
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";
import { MagicCard, MagicSet } from "./types/default";
import useRefMap from "@/hooks/useRefMap";

async function fetchSets(url:string, fcb:(data:MagicSet[])=>void) {
  let sets:MagicSet[] = [];

  const response = await fetch(url);
  const json = await response.json();
  await addSets(json.search_uri);
  
  async function addSets(url:string) {
    sets = sets.concat(json.data.map((_piece:any) => (
      {
        name:_piece.name, acronym:_piece.code,
      })));

    if (json.has_more)
      await fetchSets(json.next_page, fcb);
  }

  fcb(sets);
}

async function fetchCards(url:string, fcb:(data:MagicCard[])=>void) {
  let cards:MagicCard[] = [];

  const response = await fetch(url);
  const json = await response.json();
  await addCards(json.search_uri);
  
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

type Props = {};
export const Search:React.FC<Props> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [sets, setSets] = useState<MagicSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>(['aer']);
  const [numCardsRow, setNumCardsRow] = useState<number>(5);
  const [numCardsPage, setNumCardsPage] = useState<number>(100);
  const [optionsShown, setOptionsShown] = useState<boolean>(false);
  const [optionsIntensity, setOptionsIntensity] = useState<number>(0);
  const [optionsDragging, setOptionsDragging] = useState<boolean>(false);
  const [optionsDragPoint, setOptionsDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const [optionsDragLocation, setOptionsDragLocation] = useState<{x:number, y:number}>({x:0, y:0});
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragPoint, setDragPoint] = useState<{x:number, y:number}>({x:0, y:0});
  const {getMap, getRef} = useRefMap();

  useMouseLeavePage(() => {
    setOptionsDragging(false);
    setOptionsDragPoint({x:0, y:0});
    setOptionsDragLocation({x:0, y:0});
    setOptionsIntensity(0);
  });

  const fetchImages = async (cards:any[], cb:(image:any)=>void) => {
    type Image = {
      name:string,
      url:string,
    }
    //let images:Image[] = [];

    cards.forEach(async (_card, _index) => {
      console.log('Card to Find Image For:', _card);
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
    fetchSets(scryfallUrl + urlSets, (data) => {
      setSets(data);
    })
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCards(scryfallUrl + urlSets + "/" + selectedSets[0], (data) => {
      const cards = data.filter((_card, _index) => data.findIndex((__card) => __card.name === _card.name) === _index);

      setLoading(false);
      setCards(cards);
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
  }, [selectedSets]);

  const onChangeNumCardsRow:ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = parseInt(e.target.value);

    if (isNaN(value)) return;

    setNumCardsRow(value);
  };

  const onChangeSet:ChangeEventHandler<HTMLSelectElement> = (e) => {
    console.log('onChangeSet', e.target.value);
    setSelectedSets([e.target.value]);
  };

  const handleFiltersMouseDown:MouseEventHandler = (e) => {
    setOptionsDragging(true);
    setOptionsDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleMouseUp:MouseEventHandler = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if ((e.target as HTMLElement).tagName === "OPTION")
      return;

    setDragging(false);
    setDragPoint({x:0, y:0});
    setOptionsDragging(false);
    setOptionsDragPoint({x:0, y:0});
    setOptionsDragLocation({x:0, y:0});

    if ((!optionsShown) && (optionsDragPoint.x === x) && (optionsDragPoint.y === y))
      setOptionsShown(true);
    else if (((!optionsShown) && (optionsDragging) && (y >= 30)) ||
        ((optionsShown) && (optionsDragging) && (y <= 15)))
      setOptionsShown((_) => !_);
    
    setOptionsIntensity((!optionsShown) ? Math.max(15 - y, 0) :
                        (y <= 15) ? 5 : 0);
  };

  const handleMouseMove:MouseEventHandler = (e) => {
    const y = e.clientY;

    if (optionsDragging) {
      setOptionsDragLocation({x:e.clientX - optionsDragPoint.x, y:y - optionsDragPoint.y});

    } else if (dragging) {
      window.scrollTo(window.scrollX + dragPoint.x - e.clientX, window.scrollY + dragPoint.y - e.clientY);
      setDragPoint({x:e.clientX, y:e.clientY});

    }

    setOptionsIntensity((!optionsShown) ? Math.max(15 - y, 0) :
                        (y <= 15) ? 5 : 0);
  };

  const handleMouseDown:MouseEventHandler = (e) => {
    setDragging(true);
    setDragPoint({x:e.clientX, y:e.clientY});
  };

  const handleCardNameMouseDown:MouseEventHandler = (e) => {
    e.stopPropagation();
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

  return (<div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
    {(!loading) && <>
      <div
        onMouseDown={handleFiltersMouseDown}
        style={{
        position:'fixed',
        top: (optionsDragging && !optionsShown) ? `${-50 + (15 - optionsDragPoint.y) + optionsDragLocation.y}px` :
             (!optionsShown) ?   `${-50 + optionsIntensity + optionsDragLocation.y}px` :
                                `${optionsDragLocation.y}px`,
        left:`${5 + optionsDragLocation.x}px`,
        width:'calc(100% - 10px)',
        border: '2px solid black',
        padding:'5px',
        color: 'black',
        zIndex: '10',
        cursor:(optionsDragging) ? 'grabbing' :
               (!optionsShown) ?   'pointer' :
                                   'pointer',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-evenly',
        gap:'5px',
        borderRadius:'5px',
        height:'50px',
        boxShadow: (!optionsShown) ?
          `0px 0px ${optionsIntensity}px ${optionsIntensity}px rgba(146, 148, 248, 0.4)` :
          `0px 0px ${optionsIntensity}px ${optionsIntensity}px rgba(256, 44, 44, 0.8)`,
        backgroundColor:'white',
        transition: (optionsDragging) ? "box-shadow 0.1s ease-in-out" :
                                        "box-shadow 0.1s ease-in-out, top 0.1s ease-in-out, left 0.1s ease-in-out",
      }}>
        <label>
          Cards Per Row: <input className="hover:bg-sky-200 bg-white" name="cardsPerRow" type="number" style={{
            width:'fit-content',
            textAlign:'center',
            borderRadius:'5px',
            transition:"background-color 0.1s ease-in-out",
            }}
            defaultValue={numCardsRow} onChange={onChangeNumCardsRow}
            onMouseDown={(e)=>e.stopPropagation()}
            max={cards.length} min={1}/>
        </label>
        <label>
          Set: <select id="set" className="hover:bg-sky-200" name="set" value={selectedSets[0]} onChange={onChangeSet}
                       onMouseDown={(e)=>e.stopPropagation()} style={{
                  cursor:'pointer',
                  borderRadius:'5px',
                  padding:'2px',
                  transition:'background-color 0.1s ease-in-out',
                }}>
                {sets.map((_set, _index) => (
                  <option key={_index} value={_set.acronym}>{_set.name}</option>
                ))}
               </select>
        </label>
      </div>
    </>}
    <div
      style={{
        cursor:(optionsDragging || dragging) ? 'grabbing' : 'move',
        paddingTop:`${(!optionsShown) ? Math.min(15 + optionsDragLocation.y, 50) : 50}px`,
        overflow:'scroll',
        minWidth:'100vw',
        minHeight:'100vh',
        width:'fit-content',
        paddingLeft:'15px',
        paddingRight:'15px',
        backgroundColor:'black',
        userSelect:(optionsDragging || dragging) ? 'none' : 'auto',
        transition:(optionsDragging) ? "" : 'padding 0.1s ease-in-out',
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
            cursor:(optionsDragging || dragging) ? 'grabbing' : 'hand',
            flexDirection:'column',
            margin:'5px',
            overflow:'hidden',
            borderRadius:'12px',
            border:'1px solid rgba(255, 255, 255, 0.7)',
            transition:'top 0.3s ease-in-out',
            minWidth:'100px',}}>
          {/*<h2 key={_index} onMouseDown={handleCardNameMouseDown} style={{
            textAlign:'center',
            margin:'3px',
            cursor:(optionsDragging || dragging) ? 'grabbing' : 'text',
            }}>{_card.name}</h2>*/}
          <img src={imageMap.get(_card.name)} draggable="false" style={{
            maxWidth:'100%',
            cursor:(optionsDragging || dragging) ? 'grabbing' : 'pointer',
            marginTop:'auto',
          }}/>
        </div>
      ))}
    </div></div>
  )
};