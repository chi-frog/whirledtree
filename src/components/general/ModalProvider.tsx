'use client'

import { createContext, ReactNode, useContext, useState } from "react";
import { isCardDoublesided, MagicCard } from "../magic/types/default";
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

export const ModalProvider = ({ db, updateSelected, children }: {db:MagicDatabase, updateSelected:FilterUpdateFunction, children: ReactNode}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(-1);

  const showModal = (index:number) => {
    setShown(true);
    setIndex(index);
  }

  const hideModal = () => {
    setShown(false);
    setIndex(-1);
  }

  const modal = () => {
      if (!shown) return <></>;
      const card = db.cards[index];
      const frontImage = db.imageMap.get(card.name);
      const backImage = (card.back && isCardDoublesided(card)) ?
        db.imageMap.get(card.back.name) : db.imageMap.get("");
  
      return (
        <Modal
        close={hideModal}
        symbols={db.symbols}
        symbolImageMap={db.symbolImageMap}
        cards={db.cards}
        updateSelected={updateSelected}
        index={index}
        imagePackets={(!frontImage) ? [] :
                      (backImage)   ? [frontImage, backImage] :
                                      [frontImage]}
        />
      );
    };

  return (
    <ModalContext.Provider value={{
      showModal,
      hideModal,
    }}>
      {children}
      {modal()}
    </ModalContext.Provider>
  );
};