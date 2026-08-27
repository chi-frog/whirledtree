'use client'

import { createContext, ReactNode, useContext, useRef } from "react";
import { MagicCard } from "../magic/types/default";

type CardRepository = {
  addCard:(card:MagicCard)=>void,
  getCardPrints:(oracleId:string)=>MagicCard[],
}
const CardRepositoryContext = createContext<CardRepository|undefined>(undefined);

export const useCardRepositoryContext = () => {
  const ctx = useContext(CardRepositoryContext);

  if (ctx === undefined)
    throw new Error("useCardRepositoryContext not available");

  return ctx;
}

type CardMap = Map<string, MagicCard[]>;
type Props = {
  children:ReactNode
};
export const CardRepoProvider = ({children}:Props) => {
  const cardMap = useRef<CardMap>(new Map<string, MagicCard[]>());

  const addCard = (card:MagicCard) => {
    let cardPrints = cardMap.current.get(card.oracleId);
    cardPrints = (cardPrints) ? [...cardPrints] : [];
    
    if (cardPrints.find((_card) =>
          (_card.oracleId === card.oracleId) &&
          (_card.id === card.id)))
      return;
    
    cardPrints.push(card);
    cardMap.current.set(card.oracleId, cardPrints);
  };

  const getCardPrints = (oracleId:string) => {
    const cardPrints = cardMap.current.get(oracleId);

    return (cardPrints) ? cardPrints : [];
  };

  return (
    <CardRepositoryContext.Provider value={{
      addCard,
      getCardPrints,
    }}>
      {children}
    </CardRepositoryContext.Provider>
  )
};