'use client'

import { MagicCard, MagicCardClass } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { useEffect, useMemo, useState } from "react";
import { WError } from "@/components/magic/SearchResults";

type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };
export type ImageMap = Map<string, ImagePacket>;

export const getImageMapKey = (card:MagicCard) => {
  if (card.class !== MagicCardClass.DOUBLESIDED)
    return card.name;
}

const transformMagicCard: Transform<MagicCard> = (card) => {
  if (card.card_faces === undefined) {
    return {
      name: card.name,
      legalities: card.legalities,
      reversed:false,
      class:MagicCardClass.NORMAL,
      imageUris: {
        small: card.image_uris.small,
        large: card.image_uris.large,
      }
    };
  } else if (card.image_uris === undefined) {
    return {
      name: card.name,
      legalities: card.legalities,
      reversed:false,
      class:MagicCardClass.DOUBLESIDED,
      imageUris: {
        front: {
          small: card.card_faces[0].image_uris.small,
          large: card.card_faces[0].image_uris.large,
        },
        back: {
          small: card.card_faces[1].image_uris.small,
          large: card.card_faces[1].image_uris.large,
        }
      }
    };
  } else {
    return {
      name: card.name,
      legalities: card.legalities,
      reversed:false,
      class:MagicCardClass.DOUBLEFACED,
      imageUris: {
        small: card.image_uris.small,
        large: card.image_uris.large,
      }
    };
  }
};

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

  if (!dryImagePacket)
    dryImagePacket = {name:name};

  let imagePacket = {...dryImagePacket};
  if (type === 'small') imagePacket.smallBlob = blob;
  else if (type === 'large') imagePacket.largeBlob = blob;
  else console.log('Unknown image type', type);
  hydratedImageMap.set(name, imagePacket);
}

const hydrateImageMap = async (imageMap:Map<string, ImagePacket>, cards:MagicCard[], size:'small'|'large') => {
    let hydratedImageMap = copyImageMap(imageMap);
    
    await Promise.all(cards.map(async (_card, _index) => {
      let names = (_card.class !== MagicCardClass.DOUBLESIDED) ?
        [_card.name] :
        [_card.name + 'front', _card.name + 'back'];

      let uris = (_card.class !== MagicCardClass.DOUBLESIDED) ?
        [_card.imageUris[size]] :
        [_card.imageUris.front[size], _card.imageUris.back[size]];

      if (!uris[0]) {
        console.log('Invalid Uri for ' + _card.name, uris);
        return Promise.resolve();
      }

      return Promise.all(uris.map((_uri, _index) => {
        return fetchImage(hydratedImageMap, names[_index], size, _uri);
      }));
    }));

    return hydratedImageMap;
  };

export type UseMagicCards = [
  error:WError,
  dataLoaded:boolean,
  imagesLoaded:boolean,
  cards:MagicCard[],
  imageMap:ImageMap,
  hydrateLargeImage:(index:number)=>void,
]

const useMagicCards:(url:string)=>UseMagicCards = (url) => {
  const [imageMap, setImageMap] = useState<ImageMap>(new Map());
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  let [error, dataLoaded, cardData] = useExternalData<MagicCard>(
    url,
    transformMagicCard);

  // Deduplicate cards
  const cards:MagicCard[] = useMemo(() => {
    if ((cardData.length <= 0) ||
        (!cardData[0])) return [];
    
    return cardData.filter((_card, _index) => 
      cardData.findIndex((__card) => __card.name === _card.name) === _index);
  }, [cardData]);

  // Hydrate image map when cards change
  useEffect(() => {
    if (cards.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let cancelled = false;

    const loadImages = async () => {
      try {
        const hydratedImageMap = await hydrateImageMap(
          imageMap, 
          cards, 
          "small"
        );
        
        if (!cancelled) {
          setImageMap(hydratedImageMap);
          setImagesLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load images:', error);
          setImagesLoaded(true);
        }
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [cards]); // Re-run when cards change

  const hydrateLargeImage = async (index:number) => {
    const hydratedImageMap = await hydrateImageMap(imageMap, [cards[index]], "large");
      
    setImageMap(hydratedImageMap);
  }

  return [error, dataLoaded, imagesLoaded, cards, imageMap, hydrateLargeImage];
};

export default useMagicCards;