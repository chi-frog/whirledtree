'use client'

import { useMemo } from "react";

const widthRatio = 578/669;
const heightRatio = 550/933;

type Props = {
  location:string
};
const CardPrintSelector:React.FC<Props> = ({
  location,
}) => {
  const left = useMemo(() => {
    return (location === 'right') ?
      widthRatio*100 :
      0;
  }, []);

  return (
    <div style={{
      width:`${72/669*100}%`,
      height:`${72/933*100}%`,
      position:'absolute',
      zIndex:50,
      borderRadius:'50%',
      top:`${heightRatio*100}%`,
      left:`calc(${left}% + 66px)`,
      transform:'translate(-50%, -50%)',
    }}>
      <img src="\images\BulbArrow.svg" style={{
        width:"100%",
        height:"100%",
      }}/>
    </div>
  )
}

export default CardPrintSelector;