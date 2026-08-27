'use client'

import { memo } from "react";

type Props = {
  src?:string,
  onLoad?:()=>void,
  visible?:boolean,
  height?:string,
};
const CardFace:React.FC<Props> = ({
  src,
  onLoad,
  visible,
  height,
}) => {
  return (
    <img
      src={src} loading="lazy" draggable={false} onLoad={onLoad}
      style={{
        width:'100%',
        ...(height && { height: height }),
        marginTop:'auto',
        position:'absolute',
        objectFit:'cover',
        visibility: (visible) ? 'visible' : 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}/>
  );
};

export default memo(CardFace);