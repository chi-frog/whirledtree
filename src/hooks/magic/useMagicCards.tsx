'use client'

import { isCardDoublesided, isCardMultiple, MagicCard, MagicCardLayout } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WError } from "@/components/magic/CardDisplay";
import { partition } from "@/helpers/arrays";

export const cardHeightRatio = 938/672;
export const cardAspectRatio = 672/938;

const convertToManaCost = (manaCost:string) => {
  return manaCost;
};

// card.prints_search_uri: {}.data: [{}.image_uris]

const transformMagicCard: Transform<MagicCard> = (card) => {
  let transformedCard = ({
    id:card.id,
    oracleId:card.oracle_id,
    reversed:false,
    name:card.name, //!
    layout:(card.layout) as MagicCardLayout,
    legalities:card.legalities,
    set:card.set,
    typeLine:card.type_line, //!
    oracleText:card.oracle_text,
    power:card.power,
    toughness:card.toughness,
    manaCost:convertToManaCost(card.mana_cost),
    alchemy:false,
    siblings:[],
    imageUris:{
      small:card.image_uris?.small,
      large:card.image_uris?.large,
    }
  }) as MagicCard;

  if (isCardDoublesided(transformedCard)) {
    const front = card.card_faces[0];
    const back = card.card_faces[1];

    transformedCard.name = front.name;
    transformedCard.typeLine = front.type_line;
    transformedCard.oracleText = front.oracle_text;
    transformedCard.power = front.power;
    transformedCard.toughness = front.toughness;
    transformedCard.manaCost = front.mana_cost;
    transformedCard.imageUris = {
      small:front.image_uris.small,
      large:front.image_uris.large,};
    transformedCard.back = ({
      name:back.name,
      typeLine:back.type_line,
      oracleText:back.oracle_text,
      power:back.power,
      toughness:back.toughness,
      manaCost:back.mana_cost,
      imageUris:{
        small:back.image_uris.small,
        large:back.image_uris.large,
      },
    }) as MagicCard;
  } else if (isCardMultiple(transformedCard)) {
    const main = card.card_faces[0];
    const extra = card.card_faces[1];

    transformedCard.name = main.name;
    transformedCard.typeLine = main.type_line,
    transformedCard.extra = {
      ...transformedCard,
      name:extra.name,
      typeLine:extra.type_line,
      oracleText:extra.oracle_text,
      manaCost:extra.mana_cost,
    }
  }

  return transformedCard;
};

export type ImageSet = {
  small?:string,
  large?:string,
};
export type ImagePacket = {
  front:ImageSet,
  back:ImageSet,
  };
export type ImageMap = Map<string, Map<string, ImagePacket>>;

export const createImageSet:()=>ImageSet = () => ({});
export const createImagePacket:()=>ImagePacket = () =>
  ({front:createImageSet(),
    back:createImageSet()});
export const createImageMap:()=>ImageMap = () =>
  new Map<string, Map<string, ImagePacket>>();

export const copyImageSet:(a:ImageSet)=>ImageSet = (a:ImageSet) => ({...a});
export const copyImagePacket = (a:ImagePacket) =>
  ({front:copyImageSet(a.front),
    back:copyImageSet(a.back)});
export const copyImageMap:(imageMap:ImageMap)=>ImageMap = (imageMap) => {
  const newImageMap = new Map<string, Map<string, ImagePacket>>();

  for (const [outerKey, innerMap] of imageMap) {
    /*const newInnerMap = new Map<string, ImagePacket>();

    for (const [innerKey, value] of innerMap)
      newInnerMap.set(innerKey, {...value});*/

    newImageMap.set(outerKey, innerMap);
  }

  return newImageMap;
};

export type ImageSize = 'small' | 'large';
export const blobKey: Record<ImageSize, keyof ImageSet> = {
  small: 'small',
  large: 'large',
};

export const fetchImage = async (
  uri: string
): Promise<string|undefined> => {
  try {
    const response = await fetch(uri);
    if (!response.ok) return "";

    const blob = await response.blob();

    return URL.createObjectURL(blob);

  } catch(err) {
    console.error('fetchImageFailed:', err);
    return "";
  }
};

const hydrateImageMap = async (imageMap:ImageMap, setImageMap:Dispatch<SetStateAction<ImageMap>>, cards:MagicCard[], size:'small'|'large') => {
  const hydrateCard = async (uris:string[]) => 
    await Promise.all(uris.map(async (_uri, _index) =>
      (_uri === "") ? "" : await fetchImage(_uri)))
  
  await Promise.all(cards.map(async (_card, _index) => {
    let oracleId = _card.oracleId;
    let printId = _card.id;

    const cardImages = imageMap.get(oracleId)?.get(printId);
    let frontUri = _card.imageUris[size];
    let backUri = (_card.back) ? _card.back.imageUris[size] : "";

    if (cardImages) {
      if (cardImages.front[blobKey[size]])
        frontUri = "";
      if (cardImages.back[blobKey[size]])
        backUri = "";
    }

    if (frontUri === "" && backUri === "")
      return;

    const imageUrls = await hydrateCard([frontUri, backUri]);
      
    setImageMap((prev) => {
      const imageMap = copyImageMap(prev);
      let printsMap = imageMap.get(oracleId);
      if (!printsMap)
        printsMap = new Map<string, ImagePacket>();

      const existing = printsMap.get(printId);
      const imagePacket = (existing) ?
        {...existing} :
        createImagePacket();

      imagePacket.front[blobKey[size]] = imageUrls[0];
      imagePacket.back[blobKey[size]] = imageUrls[1];

      printsMap.set(printId, imagePacket);
      imageMap.set(oracleId, printsMap);

      return imageMap;
    });
  }));
};

export const hydrateImage = async (imageMap:ImageMap, setImageMap:Dispatch<SetStateAction<ImageMap>>, card:MagicCard, size:'small'|'large') => {
  hydrateImageMap(imageMap, setImageMap, [card], size);
};

export type UseMagicCards = [
  error:WError,
  dataLoaded:boolean,
  cards:MagicCard[],
  imageMap:ImageMap,
  hydrateImage:(card:MagicCard, size:'small'|'large')=>void,
  fetchNextData?:()=>void,
  totalCards?:number,
]
const useMagicCards:(url:string, displayLimit:number)=>UseMagicCards = (url, displayLimit) => {
  const [imageMap, setImageMap] = useState<ImageMap>(new Map());
  let [error, dataLoaded, cardData, {fetchNextData, totalCards}] =
    useExternalData<MagicCard>(url,
                               transformMagicCard,
                               {dataLimit:displayLimit, totalCards:true});
  const reserveCards = useRef<MagicCard[]>([]);

  // Filter card data
  const cards:MagicCard[] = useMemo(() => {
    if ((cardData.length <= 0)) return [];
    console.log('Card Data Changed', cardData);

    //First, get rid of anything undefined
    let cards = cardData.filter((_card) => _card)
      //Then, get rid of duplicates
      .filter((_card, _index) => 
        cardData.findIndex((__card) => __card.name === _card.name) === _index);

    //Set aside Alchemy cards
    let [alchemyCards, normalCards] = partition(cards, (_card) =>
      (_card.name.substring(0, 2) === 'A-'));
 
    //If an Alchemy card has a normal card in existence as well, fold it inside.
    //If an Alchemy card does not have a normal card, keep it in reserve.
    alchemyCards.forEach((_card, _index) => {
      let shortenedName = _card.name.substring(2);
      console.log('Found Alchemy card!', _card);
      let originalCard = normalCards.find((__card) => __card.name === shortenedName);

      _card.alchemy = true;
      _card.name = shortenedName;

      if (_card.back) {
        shortenedName = _card.back.name.substring(2);
        _card.back.alchemy = true;
        _card.back.name = shortenedName;
      }

      if (_card.extra) {
        shortenedName = _card.extra.name.substring(2);
        _card.extra.alchemy = true;
        _card.extra.name = shortenedName;
      }

      if (originalCard)
        originalCard.siblings.push(_card);
    });

    /*normalCards = normalCards.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase

      return (nameA < nameB) ? -1 :
             (nameA > nameB) ? 1 :
                               0;
      });*/
    
    return normalCards;
  }, [cardData]);

  async function fileExists(url: string) {
    const response = await fetch(url, {
      method: "HEAD",
    });

    return response.ok;
  }

  // Get the card back image
  useEffect(() => {
    const getBackImage = async () => {
      let backUrl;
      if (await fileExists('magic/defaultCardBack.png'))
        backUrl = await fetchImage('magic/defaultCardBack.png');
      else
        backUrl = await fetchImage('https://cards.scryfall.io/back.png');

      setImageMap((prev) => {
        const imageMap = copyImageMap(prev);
        let printsMap = imageMap.get("");
        if (!printsMap)
          printsMap = new Map<string, ImagePacket>();

        const existing = printsMap.get("");
        const imagePacket = (existing) ?
          existing :
          createImagePacket();

        imagePacket.front[blobKey.large] = backUrl;
        imagePacket.back[blobKey.large] = backUrl;
        imagePacket.front[blobKey.small] = backUrl;
        imagePacket.back[blobKey.small] = backUrl;

        printsMap.set("", imagePacket);
        imageMap.set("", printsMap);

        return imageMap;
      });

      console.log('Finished with back image!', backUrl);
    };

    getBackImage();
  }, []);

  const hydrateImage = useCallback(async (card:MagicCard, size:'small'|'large') => {
    hydrateImageMap(imageMap, setImageMap, [card], size);
  }, [cards, imageMap]);

  return [error, dataLoaded, cards, imageMap, hydrateImage, fetchNextData, totalCards];
};

export default useMagicCards;