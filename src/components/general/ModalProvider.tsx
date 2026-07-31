'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { isCardDoublesided } from "../magic/types/default";
import { MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import Modal from "../magic/Modal";
import { FilterUpdateFunction } from "@/hooks/magic/useFilters";

type Modal = {
  showModal:(index:number)=>void,
  hideModal:()=>void,
}
const ModalContext = createContext<Modal|undefined>(undefined);

export const useModalContext = () => {
  const ctx = useContext(ModalContext);

  if (ctx === undefined)
    throw new Error("useModalContext not available");

  return ctx;
}

const modal = (shown:boolean, db:MagicDatabase, index:number, hideModal:()=>void, updateSelected:FilterUpdateFunction) => {
  if (!shown) return <></>;

  const card = db.cards[index];
  const imagePacket = db.imageMap.get(card.oracleId)?.get(card.id);
  
  return (
    <Modal
      close={hideModal}
      symbols={db.symbols}
      symbolImageMap={db.symbolImageMap}
      cards={db.cards}
      updateSelected={updateSelected}
      index={index}
      imagePacket={imagePacket}
      cardBackImagePacket={db.imageMap.get("")?.get("")}
      />);
};

export const ModalProvider = ({ db, updateSelected, children }: {db:MagicDatabase, updateSelected:FilterUpdateFunction, children: ReactNode}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(-1);

  const showModal = useCallback((index:number) => {
    setShown(true);
    setIndex(index);
  }, []);

  const hideModal = useCallback(() => {
    setShown(false);
    setIndex(-1);
  }, []);

  return (
    <ModalContext.Provider value={{
      showModal,
      hideModal,
    }}>
      {children}
      {modal(shown, db, index, hideModal, updateSelected)}
    </ModalContext.Provider>
  );
};