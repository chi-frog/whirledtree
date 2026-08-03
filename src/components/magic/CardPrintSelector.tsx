'use client'

import { PointerEventHandler, useCallback, useMemo, useState } from "react";

const widthRatio = 578/669;
const heightRatio = 550/933;

type Props = {
  location:string
};
const CardPrintSelector:React.FC<Props> = ({
  location,
}) => {
  const [highlighted, setHighlighted] = useState<boolean>(false);

  const left = useMemo(() => {
    return (location === 'right') ?
      `calc(100% + 5px)` :
      `calc(0% + 43px)`;
  }, [location]);

  const transform = useMemo(() => {
    const translate = 'translate(-50%, -50%)';
    const flip = 'rotate(180deg)';
    
    let final = (location === 'left') ?
      translate + ' ' + flip :
      translate;

    final = (highlighted) ?
      final + ' ' + 'scale(125%)' :
      final;

    return final;
  }, [location, highlighted]);

  const pointerEnter:PointerEventHandler = useCallback(() => {
    setHighlighted(true);
  }, []);

  const pointerLeave:PointerEventHandler = useCallback(() => {
    setHighlighted(false);
  }, []);

  return (
    <div 
      onPointerEnter={pointerEnter}
      onPointerLeave={pointerLeave}
        style={{
      width:`${72/669*100}%`,
      height:`${72/933*100}%`,
      position:'absolute',
      zIndex:50,
      borderRadius:'50%',
      top:`${heightRatio*100}%`,
      left:left,
      transform:transform,
      transition:'transform 100ms ease-in-out',
      transformOrigin:'left',
    }}>
      <img src="\images\BulbArrow.svg" style={{
        width:"100%",
        height:"100%",
      }}/>
    </div>
  )
}

export default CardPrintSelector;