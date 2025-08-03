'use client'

let nextId:number;

function useId() {
  if (!nextId) nextId = Date.now();

  const getId = () => {
    return nextId++;
  };

  return {getId:getId};
}

export default useId