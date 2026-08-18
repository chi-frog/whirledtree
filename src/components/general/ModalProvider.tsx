'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import Modal from "../magic/Modal";
import { FilterUpdateFunction } from "@/hooks/magic/useFilters";
import { MagicCard } from "../magic/types/default";
import { useImageRepositoryContext } from "./ImageRepoProvider";

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

export const ModalProvider = ({ db, updateSelected, children }: {db:MagicDatabase, updateSelected:FilterUpdateFunction, children: ReactNode}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [card, setCard] = useState<MagicCard|undefined>(undefined);
  const {getImagePacket} = useImageRepositoryContext();

  const showModal = useCallback(async (card:MagicCard) => {
    const src = getImagePacket(card);

    if (src) {
      const preload = new Image();
      preload.src = (src.front.small) ? src.front.small : "";
    try {
      await preload.decode();
    } catch {
      // decode can reject (e.g. broken image, some Safari edge cases) — fall through anyway
    }
  }
    setShown(true);
    setCard(card);
  }, []);

  const hideModal = useCallback(() => {
    setShown(false);
    setCard(undefined);
  }, []);

  return (
    <ModalContext.Provider value={{
      showModal,
      hideModal,
    }}>
      {children}
      <Modal
        shown={shown}
        close={hideModal}
        symbols={db.symbols}
        symbolImageMap={db.symbolImageMap}
        updateSelected={updateSelected}
        card={card}
        cardBackImagePacket={db.imageMap.get("")?.get("")}/>
    </ModalContext.Provider>
  );
};