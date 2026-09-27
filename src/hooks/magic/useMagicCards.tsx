'use client'

import { MagicCard } from "@/components/magic/types/default";
import useExternalData from "../useExternalData";
import { useCallback, useMemo } from "react";
import { WError } from "@/components/magic/CardDisplay";
import { partition } from "@/helpers/arrays";
import { useCardRepositoryContext } from "@/components/general/CardRepoProvider";
import { transformMagicCard, transformPrint } from "@/helpers/magic/transformMagicCard";

export const cardHeightRatio = 938/672;
export const cardAspectRatio = 672/938;

export type UseMagicCards = [
  error:WError,
  dataLoaded:boolean,
  cards:MagicCard[],
  fetchNextData?:()=>void,
  totalCards?:number,
]
const useMagicCards:(url:string, displayLimit:number)=>UseMagicCards = (url, displayLimit) => {
  const {findCard, addCard, addPrint} = useCardRepositoryContext();
  
  let transformFilter = useCallback((card:any) => {
    const repoCard = findCard(card.oracleId);

    // We definitely want to finish transforming and
    // adding a card that isn't already stored in the repo.
    if (!repoCard) return true;

    const repoPrint = repoCard.prints.get(card.id);

    // We don't need to finish transforming if the 
    // print already exists.
    if (repoPrint) {
      console.log('Print already exists for card ' + card.name, card);
      return false;
    }

    // If this print doesn't exist, but the card does,
    // we need to add the print to the card's print map.
    const [printId, print] = transformPrint(card);

    addPrint(repoCard.oracleId, printId, print);

    // But the card has already been transformed before, 
    // so exit.
    return false;
  }, []);

  let [error, dataLoaded, cardData, {fetchNextData, totalCards}] =
    useExternalData<MagicCard>(
      url,
      transformMagicCard, {
        dataLimit:displayLimit,
        totalCards:true,
        transformFilter,
      });

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

      _card.name = shortenedName;

      if (_card.back) {
        shortenedName = _card.back.name.substring(2);
        _card.back.name = shortenedName;
      }

      if (_card.extra) {
        shortenedName = _card.extra.name.substring(2);
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