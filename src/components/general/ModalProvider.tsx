'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import Modal from "../magic/Modal";
import { FilterUpdateFunction } from "@/hooks/magic/useFilters";
import { MagicCard } from "../magic/types/default";

type Modal = {
  showModal:(card:MagicCard)=>void,
  hideModal:()=>void,
}
const ModalContext = createContext<Modal|undefined>(undefined);

export const useModalContext = () => {
  const ctx = useContext(ModalContext);

  if (ctx === undefined)
    throw new Error("useModalContext not available");

  return ctx;
}

const modal = (shown:boolean, db:MagicDatabase, card:MagicCard|null, hideModal:()=>void, updateSelected:FilterUpdateFunction) => {
  if (!shown || !card) return <></>;

  const imagePacket = db.imageMap.get(card.oracleId)?.get(card.id);
  
  return (
    <Modal
      close={hideModal}
      symbols={db.symbols}
      symbolImageMap={db.symbolImageMap}
      updateSelected={updateSelected}
      card={card}
      imagePacket={imagePacket}
      cardBackImagePacket={db.imageMap.get("")?.get("")}
      />);
};

export const ModalProvider = ({ db, updateSelected, children }: {db:MagicDatabase, updateSelected:FilterUpdateFunction, children: ReactNode}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [card, setCard] = useState<MagicCard|null>(null);

  const showModal = useCallback((card:MagicCard) => {
    setShown(true);
    setCard(card);
  }, []);

  const hideModal = useCallback(() => {
    setShown(false);
    setCard(null);
  }, []);

  return (
    <ModalContext.Provider value={{
      showModal,
      hideModal,
    }}>
      {children}
      {modal(shown, db, card, hideModal, updateSelected)}
    </ModalContext.Provider>
  );
};