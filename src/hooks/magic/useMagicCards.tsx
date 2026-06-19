'use client'

import { isCardDoublesided, isCardMultiple, MagicCard, MagicCardLayout } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
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
  uri: string
): Promise<string|undefined> => {
  const objectUrl = await fetch(uri)
    .then(r => r.blob())
    .then(blob => URL.createObjectURL(blob))
    .catch(err => { console.error('fetchImage failed:', err); return null; });

  if (!objectUrl) return Promise.resolve("");

  return Promise.resolve(objectUrl);
};

const hydrateImageMap = async (setImageMap:Dispatch<SetStateAction<ImageMap>>, cards:MagicCard[], size:'small'|'large') => {
    const hydrateCard = async (names:string[], uris:string[]) => {
      let imageUrls = await Promise.all(uris.map(async (_uri, _index) => {
        const imageUrl = await fetchImage(_uri);

        return imageUrl;
      }));

      return imageUrls;
    };
  
    await Promise.all(cards.map(async (_card, _index) => {
      let names = (isCardDoublesided(_card)) ?
        [_card.name] :
        [_card.name, (_card.back) ? _card.back.name : ""];

      let uris = (!isCardDoublesided(_card)) ?
        [_card.imageUris[size]] :
        [_card.imageUris[size], (_card.back) ? _card.back.imageUris[size] : ""];

      const imageUrls = await hydrateCard(names, uris);
      
      setImageMap((prev) => {
        let imageMap = copyImageMap(prev);
        const frontExisting = prev.get(names[0]) ?? {name:names[0]};
        const backExisting = (names[1]) ? (prev.get(names[1])) ?? {name:names[1]} : null;
      
        if (frontExisting) {
          imageMap.set(names[0], {
            ...frontExisting,
            [blobKey[size]]:imageUrls[0],
          });
        }
        if (backExisting) {
          imageMap.set(names[1], {
            ...backExisting,
            [blobKey[size]]:imageUrls[1],
          });
        }

        return imageMap;
      });
    }));
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

  // Get the card back image
  useEffect(() => {
    const getBackImage = async () => {
      const backUrl = await fetchImage('https://cards.scryfall.io/back.png');

      setImageMap((prev) => {
        let imageMap = copyImageMap(prev);
        let name = "";
        const existing = prev.get(name) ?? {name};
      
        if (existing) {
          imageMap.set(name, {
            ...existing,
            [blobKey.large]:backUrl,
          });
        }

        return imageMap;
      });
      
      return backUrl;
    };

    getBackImage();
  }, []);

  // Hydrate image map when cards change
  useEffect(() => {
    if ((cards.length === 0) && (dataLoaded)) {
      setImagesLoaded(true);
      return;
    }

    let cancelled = false;
    setImagesLoaded(false);

    const loadImages = async () => {
      try {
        await hydrateImageMap(
          setImageMap,
          cards, 
          "small"
        );
        
        if (!cancelled) {
          setImagesLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load images:', error);
          setImagesLoaded(false);
        }
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [cards]); // Re-run when cards change

  const hydrateLargeImage = useCallback(async (index:number) => {
    const hydratedImageMap = await hydrateImageMap(setImageMap, [cards[index]], "large");
      
    //setImageMap(hydratedImageMap);
  }, [cards, imageMap]);

  return [error, dataLoaded, imagesLoaded, cards, imageMap, hydrateLargeImage];
};

export default useMagicCards;