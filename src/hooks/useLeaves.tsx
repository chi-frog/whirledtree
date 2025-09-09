'use client'

import { useState } from "react";
import { Font } from "./useFont";

export type Leaf = {
  id:number,
  x:number,
  y:number,
  font:Font,
  fontSize:number,
  content:string,
  optionsFocused:boolean,
}

export type leafTb = {
  set:Function,
  create:Function,
  update:Function,
  updateField:Function,
  updateFields:Function,
  remove:Function,
  removeEmpty:Function,
  bringToFront:Function,
  transformContent:Function,
}

function useLeaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  
  const create = ({x, y, font, fontSize, content=""} :
                  {x:number, y:number, font:Font, fontSize:number, content:string}) => {
    const id = Date.now();
    
    setLeaves((_leafs:Leaf[]) => _leafs.concat({
      id:id,
      x:x,
      y:y,
      font:font,
      fontSize:fontSize,
      content:content,
      optionsFocused:false,}));

    return id;
  }

  const update = (id:number, callback:(_leaf:Leaf)=>Leaf) =>
    setLeaves((_leaves) => 
      _leaves.map((_leaf) =>
        (_leaf.id === id) ?
          (callback(_leaf)) :
          (_leaf)));

  const updateField = <K extends keyof Leaf>
    (id:number, key:K, callback:(prev: Leaf[K]) => Leaf[K]) =>
    setLeaves((_leaves) =>
      _leaves.map((_leaf) =>
        (_leaf.id === id)
          ? {..._leaf,
            [key]: callback(_leaf[key]),}
          : _leaf));

  const updateFields = <K extends keyof Leaf>
    (id: number, keys: K[], callbacks: ((prev: Leaf[K]) => Leaf[K])[]) =>
    setLeaves((_leaves) =>
      _leaves.map((_leaf) => {
        if (_leaf.id === id) {
          const newLeaf = {..._leaf};

          for (let i=0,key=keys[i]; i<keys.length; i++,key=keys[i])
            newLeaf[key] = callbacks[i](newLeaf[key])

          return newLeaf;
          }
        else
          return _leaf}));

  const remove = (id:number) =>
    setLeaves((_leaves) =>
      _leaves.filter((_leaf) =>
        (_leaf.id !== id)));

  const removeEmpty = () =>
    setLeaves((_leaves) => _leaves.filter((_leaf) => _leaf.content !== ""));

  const bringToFront = (id:number) =>
    setLeaves((_leaves:Leaf[]) => {
      const leafToRemoveIndex = _leaves.findIndex((_leaf:Leaf) => (_leaf.id === id));
      const leafToRemove = _leaves.splice(leafToRemoveIndex, 1)[0];
      _leaves.push(leafToRemove);
    
      return _leaves;});

  const transformContent = (id:number, callback:Function) =>
    setLeaves((_leaves) => 
      _leaves.map((_leaf:Leaf) =>
        (_leaf.id === id) ?
          {..._leaf,
           content: callback(_leaf.content)} :
          (_leaf)));

  const leafTb = {
    set:setLeaves,
    create,
    update,
    updateField,
    updateFields,
    remove,
    removeEmpty,
    bringToFront,
    transformContent,
  }

  return {leaves, leafTb}
}

export default useLeaves;