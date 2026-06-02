'use client'

import { isCardDoublesided, isCardMultiple, MagicCard, MagicCardLayout } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { useEffect, useMemo, useState } from "react";
import { WError } from "@/components/magic/CardDisplay";

type ImagePacket = {
  name:string,
  smallBlob?:string,
  largeBlob?:string,
  };
export type ImageMap = Map<string, ImagePacket>;

const transformMagicCard: Transform<MagicCard> = (card) => {
  let transformedCard = {
    reversed:false,
    name:card.name, //!
    layout:(card.layout) as MagicCardLayout,
    legalities:card.legalities,
    set:card.set,
    typeLine:card.type_line, //!
    alchemy:false,
    siblings:[],
    back:({}) as MagicCard,
    extra:({}) as MagicCard,
    imageUris:{
      small:card.image_uris?.small,
      large:card.image_uris?.large,
    }
  };

  if (isCardDoublesided(transformedCard)) {
    console.log('Doublesided', transformedCard);
    console.log('-----------', card);
    const front = card.card_faces[0];
    const back = card.card_faces[1];

    transformedCard.name = front.name;
    transformedCard.typeLine = front.type_line;
    transformedCard.imageUris = {
      small:front.image_uris.small,
      large:front.image_uris.large,};
    transformedCard.back = ({
      name:back.name,
      typeLine:back.type_line,
      imageUris:{
        small:back.image_uris.small,
        large:back.image_uris.large,
      },
    }) as MagicCard
  } else if (isCardMultiple(transformedCard)) {
    console.log('Multiple', transformedCard);
    const main = card.card_faces[0];
    const extra = card.card_faces[1];

    transformedCard.name = main.name;
    transformedCard.typeLine = main.type_line,
    transformedCard.extra = {
      ...transformedCard,
      name:extra.name,
      typeLine:extra.type_line,
    }
  }

  return transformedCard;
};

const copyImageMap:(imageMap:ImageMap)=>ImageMap = (imageMap) => {
  const newImageMap = new Map<string, ImagePacket>();

  for (const [key, value] of imageMap)
    newImageMap.set(key, value);

  return newImageMap;
};

type ImageSize = 'small' | 'large';

const blobKey: Record<ImageSize, keyof ImagePacket> = {
  small: 'smallBlob',
  large: 'largeBlob',
};

const fetchImage = async (
  hydratedImageMap: ImageMap,
  name: string,
  type: ImageSize,
  uri: string
): Promise<void> => {
  const objectUrl = await fetch(uri)
    .then(r => r.blob())
    .then(blob => URL.createObjectURL(blob))
    .catch(err => { console.error('fetchImage failed:', err); return null; });

  if (!objectUrl) return;

  const existing = hydratedImageMap.get(name) ?? { name };
  hydratedImageMap.set(name, {
    ...existing,
    [blobKey[type]]: objectUrl,
  });
};

const hydrateImageMap = async (imageMap:Map<string, ImagePacket>, cards:MagicCard[], size:'small'|'large') => {
    let hydratedImageMap = copyImageMap(imageMap);
    
    await Promise.all(cards.map(async (_card, _index) => {
      let names = (!isCardDoublesided(_card)) ?
        [_card.name] :
        [_card.name, (_card.back) ? _card.back.name : ""];

      let uris = (!isCardDoublesided(_card)) ?
        [_card.imageUris[size]] :
        [_card.imageUris[size], (_card.back) ? _card.back.imageUris[size] : ""];

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
    transformMagicCard,
    {dataLimit:500});

  // Filter card data
  const cards:MagicCard[] = useMemo(() => {
    if ((cardData.length <= 0)) return [];

    //First, get rid of anything undefined
    let cards = cardData.filter((_card) => _card)
      //Then, get rid of duplicates
      .filter((_card, _index) => 
        cardData.findIndex((__card) => __card.name === _card.name) === _index);

    //Set aside Alchemy cards
    const alchemyCards = cards.filter((_card) => _card.name.substring(0, 2) === 'A-');

    //If an Alchemy card has a normal card in existence as well, fold it inside.
    //If an Alchemy card does not have a normal card, keep it separate.
    alchemyCards.forEach((_card, _index) => {
      let shortenedName = _card.name.substring(2);
      let originalCard = cards.find((__card) => __card.name === shortenedName);

      _card.alchemy = true;
      _card.name = shortenedName;

      if (originalCard) {
        originalCard.siblings.push(_card);
        cards.splice(_index, 1);
      }
    });

    cards = cards.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase

      return (nameA < nameB) ? -1 :
             (nameA > nameB) ? 1 :
                               0;
      });
    
    return cards;
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
        console.log('imageFetch error', error);
        console.log('cancelled?', cancelled);
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