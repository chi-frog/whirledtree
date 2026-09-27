'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { MagicResources } from "@/hooks/magic/useMagicResources";
import Modal from "../magic/modal/Modal";
import { SelectionUpdateFunction } from "@/hooks/magic/useSelection";
import { MagicCard } from "../magic/types/default";
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

export const ModalProvider = ({
  resources,
  updateSelected,
  children
}:{resources:MagicResources, updateSelected:SelectionUpdateFunction, children: ReactNode}) => {
  const store = useRef(createModalStore()).current;

  const showModal = useCallback(async (card:MagicCard) => {
    store.setState({ shown: true, card });
  }, [store]);

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
        resources={resources}
        updateSelected={updateSelected}
      />
    </ModalStoreContext.Provider>
    </ModalContext.Provider>
  );
};

function ModalSubscriber({ store, hideModal, resources, updateSelected }: {
  store: ReturnType<typeof createModalStore>,
  hideModal: () => void,
  resources:MagicResources,
  updateSelected: SelectionUpdateFunction,
}) {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  return (
    <Modal
      shown={state.shown}
      close={hideModal}
      symbols={resources.symbols}
      symbolImageMap={resources.symbolImageMap}
      updateSelected={updateSelected}
      card={state.card}/>
  );
}