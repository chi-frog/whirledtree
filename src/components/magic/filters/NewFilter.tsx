'use client'

import { ChangeEventHandler, memo, PointerEventHandler, useMemo, useRef, useState } from "react";
import { FilterState } from "../CardDisplay";
import { motion } from "framer-motion";
import FilterButton from "./FilterButton";
import { Selected } from "@/hooks/magic/useFilters";
import XOut from "./XOut";

type Props = {
  state:FilterState,
  setState:(state:FilterState)=>void,
  selected:Selected,
  handlers:Record<keyof Selected, ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>,
};
const NewFilter:React.FC<Props> = ({
  state,
  setState,
  selected,
  handlers,
}) => {
  const mousedOver = useMemo(() => (state === FilterState.MOUSEDOVER), [state]);
  const reduced = useMemo(() => (state === FilterState.REDUCED), [state]);

  const onPointerEnter:PointerEventHandler = () => {
    if (state === FilterState.HIDDEN)
      setState(FilterState.MOUSEDOVER);
  }

  const onPointerLeave:PointerEventHandler = () => {
    if (state === FilterState.MOUSEDOVER)
      setState(FilterState.HIDDEN);
  }

  const pressed = useRef<boolean>(false);
  const onPointerDown:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();

    pressed.current = true;
  }

  const onPointerUp:PointerEventHandler = (e:React.PointerEvent) => {
    e.stopPropagation();
    
    if (pressed.current) {
      pressed.current = false;
      setState(FilterState.REDUCED);
    }
  }

  return (<>
    <div
      style={{
      position:'fixed',
      width:'10px',
      height:'10px',
      zIndex:40,
      top:'20px',
      left:'20px',
      borderRadius:'50%',
      visibility: (mousedOver || reduced) ? 'hidden' : 'visible',
      background: 'radial-gradient(circle, rgba(146, 148, 248, 0.8), rgba(173, 216, 230, 0))',
      animation: 'ripple-out 6s ease-out infinite',
      pointerEvents:'none',
    }}/>
    <motion.div
      title="Adjust Filter Options"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        display:'flex',
        zIndex: 40,
        cursor: (!reduced) ? 'pointer' : 'default',
        background: 'rgba(146, 148, 248, 0.8)', // lighter blue base
        overflow: 'hidden', // keeps the blurred overlay clipped to this shape too
      }}
      animate={{
        top: (mousedOver) ? '7px' : '10px',
        left: (mousedOver) ? '7px' : '10px',
        width: (mousedOver) ? '50px' : (reduced) ? 'calc(100% - 20px)' : '30px',
        height: (mousedOver) ? '50px' : (reduced) ? '85px' : '30px',
        borderRadius: (reduced) ? '5px' : '50%',
        boxShadow:
          (mousedOver) ?
            '0px 0px 10px white' :
          (reduced) ?
            '0px 0px 2px white' :
            '0px 0px 0px rgba(255, 255, 255, 0)',
        opacity: (mousedOver || reduced) ? 1 : 0.4,
      }}
      transition={{ 
        top: { duration: 0.2, ease: 'easeInOut' },
        left: { duration: 0.2, ease: 'easeInOut' },
        borderRadius: { duration: 0.2, ease: 'easeInOut' },
        width: { duration: 0.2, ease: 'easeInOut', },
        height: { duration: 0.2, ease: 'easeInOut', },
        boxShadow: { duration: 0.2, ease: 'easeInOut' },
        opacity: { duration: 0.2, ease: 'easeInOut' }}}>
      <motion.div
        style={{
          position: 'absolute',
          inset: '10px', // pulls the overlay in from every edge by the same amount
          background: 'rgba(0, 0, 0, 0.8)',
          filter: 'blur(6px)',
        }}
        animate={{
          borderRadius: (reduced) ? '5px' : '50%',
        }}
        transition={{
          borderRadius: { duration: 0.2, ease: 'easeInOut' },
        }}/>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:'absolute',
          padding:'5px',
          opacity:(mousedOver) ? 1 : 0,
          transition:'opacity 0.3s ease-in-out',
          pointerEvents:(!mousedOver) ? 'none' : 'auto',
        }}>
        <path d="M4 5L10 5M10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5M10 5C10 3.89543 10.8954 3 12 3C13.1046 3 14 3.89543 14 5M14 5L20 5M4 12L16 12M16 12C16 13.1046 16.8954 14 18 14C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12ZM8 19L20 19M8 19C8 17.8954 7.10457 17 6 17C4.89543 17 4 17.8954 4 19C4 20.1046 4.89543 21 6 21C7.10457 21 8 20.1046 8 19Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <XOut
        cancel={() => setState(FilterState.MOUSEDOVER)}
        visible={reduced}
        offsets={{left:1, top:1}}
        animateOffsets={{left:10, top:10}}/>
      {(reduced) && <>
      <FilterButton
        id="name"
        text="Name"
        value={selected.name}
        onChange={handlers.name}
        />
      </>}
    </motion.div>
  </>)
};

export default memo(NewFilter);