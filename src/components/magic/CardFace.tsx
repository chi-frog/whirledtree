'use client'

import { memo, useEffect, useMemo, useRef, useState } from "react";
import useDefaultCardBack from "@/hooks/magic/useDefaultCardBack";

type Props = {
  loc:string,
  src?:string,
  onLoad?:()=>void,
  visible?:boolean,
  height?:string,
};
const CardFace: React.FC<Props> = ({
  loc,
  src,
  visible,
  height,
  onLoad
}) => {
  const { ready, uri } = useDefaultCardBack();
  const [loaded, setLoaded] = useState(false);
  const srcReady = useMemo(() => Boolean(src), [src]);
  const resolvedSrc = srcReady ? src : ready ? uri : undefined;
  const currentSrcRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!resolvedSrc) return;

    let cancelled = false;
    currentSrcRef.current = resolvedSrc;
    setLoaded(false); // reset crossfade state whenever the target src changes

    const preload = new Image();
    preload.src = resolvedSrc;

    preload.decode()
      .catch(() => {
        // decode can reject (e.g. broken image, some Safari edge cases) — fall through anyway
      })
      .finally(() => {
        // only mark loaded if this effect's src is still the one we care about
        if (!cancelled && currentSrcRef.current === resolvedSrc) {
          setLoaded(true);
          onLoad?.();
        }
      });

    return () => { cancelled = true; };
  }, [resolvedSrc]);

  return (
    <img
      src={resolvedSrc}
      loading={(loc === 'view') ? "lazy" : "eager"}
      draggable={false}
      style={{
        width: '100%',
        ...(height && { height }),
        marginTop: 'auto',
        position: 'absolute',
        objectFit: 'cover',
        visibility: visible ? 'visible' : 'hidden',
        opacity: loaded ? 1 : 0,
        transition: (loc === 'view') ? 'opacity 0.15s ease-in' : '',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );
};

export default memo(CardFace);