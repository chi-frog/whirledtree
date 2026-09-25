'use client'

import { isCardDoublesided, isCardMultiple, MagicCard, MagicCardLayout } from "@/components/magic/types/default";
import useExternalData, { Transform } from "../useExternalData";
import { useCallback, useMemo, useRef, useState } from "react";
import { WError } from "@/components/magic/CardDisplay";
import { partition } from "@/helpers/arrays";
import { useCardRepositoryContext } from "@/components/general/CardRepoProvider";
import { hydrateImageMap } from "@/components/general/ImageRepoProvider";
import { ImageMap } from "@/components/magic/types/imageRepo";

export const cardHeightRatio = 938/672;
export const cardAspectRatio = 672/938;

const convertToManaCost = (manaCost:string) => {
  return manaCost;
};

// card.prints_search_uri: {}.data: [{}.image_uris]

export const transformMagicCard: Transform<MagicCard> = (card) => {
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
    flavorText:card.flavor_text,
    power:card.power,
    toughness:card.toughness,
    manaCost:convertToManaCost(card.mana_cost),
    alchemy:false,
    siblings:[],
    imageUris:{
      small:card.image_uris?.small,
      large:card.image_uris?.large,
    },
    printsUri:card.prints_search_uri,
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

export type UseMagicCards = [
  error:WError,
  dataLoaded:boolean,
  cards:MagicCard[],
  fetchNextData?:()=>void,
  totalCards?:number,
]
const useMagicCards:(url:string, displayLimit:number)=>UseMagicCards = (url, displayLimit) => {
  let [error, dataLoaded, cardData, {fetchNextData, totalCards}] =
    useExternalData<MagicCard>(url,
                               transformMagicCard,
                               {dataLimit:displayLimit, totalCards:true});
  const reserveCards = useRef<MagicCard[]>([]);
  const {addCard} = useCardRepositoryContext();

  // Filter card data
  const cards:MagicCard[] = useMemo(() => {
    if ((cardData.length <= 0)) return [];

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

    normalCards.forEach((_card) => addCard(_card));
    
    return normalCards;
  }, [cardData]);

  return [error, dataLoaded, cards, fetchNextData, totalCards];
};

export default useMagicCards;