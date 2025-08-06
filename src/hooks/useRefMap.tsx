'use client'

import { useRef } from "react";

function useRefMap() {
  const elementsRef = useRef<Map<any, any>|null>(null);

  function getMap() {
    if (!elementsRef.current)
      elementsRef.current = new Map();

    return elementsRef.current;
  }

  //NOTE: Clean up typing in this hook
  const getRef = (id:number, node:any) => {
    if (!node) return () => {};

    const map = getMap();
    map.set(id, node);

    return () => map.delete(id);
  };

  return {getMap, getRef};
}

export default useRefMap;