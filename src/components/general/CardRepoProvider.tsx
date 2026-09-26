'use client'

import { createContext, ReactNode, useContext, useRef } from "react";
import { MagicCard, MagicPrint } from "../magic/types/default";

type CardRepository = {
  findCard:(oracleId:string)=>MagicCard|undefined,
  findPrint:(oracleId:string, id:string)=>MagicPrint|undefined,
  addCard:(card:MagicCard)=>void,
  addPrint:(oracleId:string, id:string, print:MagicPrint)=>void,
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
    console.log('Added card ' + card.name + ' to repository', card);
  };

  const addPrint = (oracleId:string, id:string, print:MagicPrint) => {
    let storedCard = cardMap.current.get(oracleId);
    if (!storedCard) {
      console.error("Shouldn't use addPrint if the card isn't already stored:" + oracleId);
      return;
    }

    if (storedCard.prints.get(id)) {
      console.log('Print already exists:' + oracleId + ', ' + id);
      return;
    }

    console.log('Adding print ' + storedCard.name + ' to repository', print);
    storedCard.prints.set(id, print);
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