'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { MagicDatabase } from "@/hooks/magic/useMagicDatabase";
import Modal from "../magic/Modal";
import { FilterUpdateFunction } from "@/hooks/magic/useFilters";
import { MagicCard } from "../magic/types/default";
import { useImageRepositoryContext } from "./ImageRepoProvider";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";

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

// --- external store: lives outside React state, so updating it ---
// --- doesn't re-render anything that only calls useModalContext() ---
type ModalState = {
  shown: boolean;
  card: MagicCard | undefined;
};

function createModalStore() {
  let state: ModalState = { shown: false, card: undefined };
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (next: Partial<ModalState>) => {
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

// --- separate context exposing just the store, so components can
// --- opt into reading modal state via a selector without forcing
// --- every consumer to re-render on every store update ---
const ModalStoreContext = createContext<ReturnType<typeof createModalStore> | undefined>(undefined);

export const useIsCardInModal = (cardName: string) => {
  const store = useContext(ModalStoreContext);

  if (store === undefined)
    throw new Error("useIsCardInModal not available");

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    (state) => state.shown && state.card?.name === cardName,
  );
};

export const ModalProvider = ({ db, updateSelected, children }: {db:MagicDatabase, updateSelected:FilterUpdateFunction, children: ReactNode}) => {
  const store = useRef(createModalStore()).current;
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
    
    store.setState({ shown: true, card });
  }, [getImagePacket, store]);

  const hideModal = useCallback(() => {
    store.setState({ shown: false, card: undefined });
  }, [store]);

  const value = useMemo(() => ({ showModal, hideModal }), [showModal, hideModal]);

  return (
    <ModalContext.Provider value={value}>
    <ModalStoreContext.Provider value={store}>
      {children}
      <ModalSubscriber
        store={store}
        hideModal={hideModal}
        db={db}
        updateSelected={updateSelected}
      />
    </ModalStoreContext.Provider>
    </ModalContext.Provider>
  );
};

function ModalSubscriber({ store, hideModal, db, updateSelected }: {
  store: ReturnType<typeof createModalStore>,
  hideModal: () => void,
  db: MagicDatabase,
  updateSelected: FilterUpdateFunction,
}) {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  return (
    <Modal
      shown={state.shown}
      close={hideModal}
      symbols={db.symbols}
      symbolImageMap={db.symbolImageMap}
      updateSelected={updateSelected}
      card={state.card}/>
  );
}