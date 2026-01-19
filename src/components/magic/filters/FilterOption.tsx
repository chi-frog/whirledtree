'use client'

import { PropsWithChildren, ReactNode } from "react";

type Props = {
  text:string,
  children:ReactNode,
};

const FilterOption:React.FC<Props> = ({text, children}:PropsWithChildren<Props>) => {

  return (
    <label onMouseDown={(e)=>e.stopPropagation()} onMouseUp={(e)=>e.stopPropagation()} style={{
        display:'flex',
        boxShadow:'0px 0px 5px 5px white',
        background:'white',
        borderRadius:'5px',
        maxHeight:'100%',
        textWrap:'nowrap',
        alignItems:'center',
        }}>
        <h1 style={{fontWeight:'bold'}}>{text}{'\u00A0'}</h1>
        {children}
      </label>
  )
};

export default FilterOption;