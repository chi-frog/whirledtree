'use client'

import { memo, useEffect, useMemo } from "react";
import { useImageRepositoryContext } from "../general/ImageRepoProvider";
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
  const {getImagePacket} = useImageRepositoryContext();
  const {ready, uri} = useDefaultCardBack();
  const srcReady = useMemo(() => src && (src !== ''), [src]);

  return (<>
    {(ready || srcReady) &&
    <img
      src={!srcReady ? uri : src} loading="lazy" draggable={false}
      style={{
        width:'100%',
        ...(height && { height: height }),
        marginTop:'auto',
        position:'absolute',
        objectFit:'cover',
        visibility: (visible) ? 'visible' : 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
    }}/>}
  </>);
};

export default memo(CardFace);