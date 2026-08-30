'use client'

import { memo, useEffect, useMemo } from "react";
import useDefaultCardBack from "@/hooks/magic/useDefaultCardBack";

type Props = {
  src?:string,
  onLoad?:()=>void,
  visible?:boolean,
  height?:string,
};
const CardFace:React.FC<Props> = ({
  src,
  visible,
  height,
}) => {
  const {ready, uri} = useDefaultCardBack();
  const srcReady = useMemo(() => src && (src !== ''), [src]);

  return (
    <img
      src={srcReady ? src :
           ready    ? uri :
           'magic/defaultCardBack.png'}
      loading="lazy" draggable={false}
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