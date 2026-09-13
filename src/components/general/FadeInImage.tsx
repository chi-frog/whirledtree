'use client'

import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (src === slots[frontIndex]) return; // already showing this src

    latestSrc.current = src;
    const backIndex = (frontIndex === 0) ? 1 : 0;

    let cancelled = false;
    setBackLoaded(false);

    const img = new Image();
    img.src = src;
    img.decode()
      .catch(() => { /* fall through anyway */ })
      .finally(() => {
        if (cancelled || latestSrc.current !== src) return;

        // put the now-decoded src into the back slot, THEN mark loaded
        setSlots((prev) => {
          const next:[string, string] = [...prev];
          next[backIndex] = src;
          return next;
        });
        setBackLoaded(true);
      });

    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    if (!backLoaded) return;

    const timeout = setTimeout(() => {
      setFrontIndex((prev) => (prev === 0 ? 1 : 0)); // back slot becomes front
      setBackLoaded(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [backLoaded]);

  return (
    <>
      {(visible) && [0, 1].map((i) => {
        const isFront = i === frontIndex;
        return (
          <img
            key={i}
            src={slots[i]}
            draggable={false}
            loading={loading}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isFront ? 1 : backLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
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