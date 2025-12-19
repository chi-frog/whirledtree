'use client'

import { PropsWithChildren, ReactNode } from "react";

type Props = {
  text:string,
  dragging?:boolean,
  children:ReactNode,
};

const FilterOption:React.FC<Props> = ({text, dragging, children}:PropsWithChildren<Props>) => {

  return (
    <label onMouseDown={(e)=>e.stopPropagation()} onMouseUp={(e)=>e.stopPropagation()} style={{
        display:'flex',
        boxShadow:'0px 0px 5px 5px white',
        background:'white',
        }}>
        <h1 style={{fontWeight:'bold', cursor:(dragging) ? 'grabbing' : 'auto'}}>{text}</h1>
        {children}
      </label>
  )
};

export default FilterOption;