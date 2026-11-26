'use client'

import { createContext, ReactNode, useContext, useRef } from "react";
import { MagicCard, MagicPrint } from "../magic/types/default";

type CardRepository = {
  findCard:(oracleId:string)=>MagicCard|undefined,
  findPrint:(oracleId:string, id:string)=>MagicPrint|undefined,
  addCard:(card:MagicCard)=>void,
  addPrint:(card:MagicCard, print:MagicPrint)=>void,
}
const CardRepositoryContext = createContext<CardRepository|undefined>(undefined);

export const useCardRepositoryContext = () => {
  const ctx = useContext(CardRepositoryContext);

  if (ctx === undefined)
    throw new Error("useCardRepositoryContext not available");

  return ctx;
}

type CardMap = Map<string, MagicCard>;
type Props = {
  children:ReactNode
};
export const CardRepoProvider = ({children}:Props) => {
  const cardMap = useRef<CardMap>(new Map<string, MagicCard>());

  const findCard = (oracleId:string) => cardMap.current.get(oracleId)
  const findPrint = (oracleId:string, id:string) => findCard(oracleId)?.prints.get(id)

  const addCard = (card:MagicCard) => {
    let storedCard = cardMap.current.get(card.oracleId);
    if (storedCard) return;

    cardMap.current.set(card.oracleId, card);
  };

  const addPrint = (card:MagicCard, print:MagicPrint) => {
    let storedCard = cardMap.current.get(card.oracleId);
    if (!storedCard) {
      addCard(card);
      console.log('card didnt exist - added');
      return;
    }

    if (storedCard.prints.get(card.printId)) {
      return;
    }

    console.log('stored print');
    storedCard.prints.set(card.printId, print);
  }

  return (
    <CardRepositoryContext.Provider value={{
      findCard,
      findPrint,
      addCard,
      addPrint,
    }}>
      {children}
    </CardRepositoryContext.Provider>
  )
};