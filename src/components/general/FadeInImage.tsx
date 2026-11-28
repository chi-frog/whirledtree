'use client'

import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImageStorageContext } from "./ImageStorageProvider";

type Props = {
  src: string,
  visible: boolean,
  loading:"eager" | "lazy" | undefined,
};
const FadeInImage: React.FC<Props> = ({
    src,
    visible,
    loading,
  }) => {
  // two stable slots — which one is "front" (currently shown) alternates,
  // but neither slot's own <img> ever has its src changed while visible
  const [slots, setSlots] = useState<[string, string]>([src, src]);
  const [frontIndex, setFrontIndex] = useState<0 | 1>(0);
  const [backLoaded, setBackLoaded] = useState(false);
  const latestSrc = useRef(src);
  const {storeImage, getImage} = useImageStorageContext();

  useEffect(() => {
    if (src === slots[frontIndex]) return; // already showing this src

    latestSrc.current = src;
    const backIndex = (frontIndex === 0) ? 1 : 0;

    console.log('We are in FadeInImage');
    const image = getImage(src);
    let cancelled = false;

    function swap() {
      if (cancelled || latestSrc.current !== src) return;

      // put the now-decoded src into the back slot, THEN mark loaded
      setSlots((prev) => {
        const next:[string, string] = [...prev];
        next[backIndex] = src;
        return next;
      });
      setBackLoaded(true);
    }

    if (image) return swap()

    setBackLoaded(false);

    const img = new Image();
    img.src = src;
    img.decode()
      .catch(() => { /* Add error correction */ })
      .finally(() => swap());

    return () => {
      cancelled = true;
      img.src = '';
    };
  }, [src]);

  useEffect(() => {
    if (!backLoaded) return;
    console.log('is this happening?');
    const timeout = setTimeout(() => {
      setFrontIndex((prev) => (prev === 0 ? 1 : 0)); // back slot becomes front
      setBackLoaded(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [backLoaded]);

  const onLoad = useCallback((e:SyntheticEvent<HTMLImageElement, Event>) => {
    storeImage(e.currentTarget.src, e.currentTarget); 
  }, []);

  if (!visible) return null;

  return (
    <>
      {[0, 1].map((i) => {
        const isFront = i === frontIndex;
        return (
          <img
            key={i}
            src={slots[i]}
            draggable={false}
            loading={loading}
            onLoad={onLoad}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: (isFront || backLoaded) ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents:'none',
            }}
          />
        );
      })}
    </>
  );
};

export default FadeInImage;