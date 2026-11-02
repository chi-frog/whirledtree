'use client';

import { ReactNode, useLayoutEffect, useRef, useState } from "react";

type Props = {
  style:React.CSSProperties
  children:ReactNode
};
const ResizeContainer:React.FC<Props> = ({
    style,
    children
  }) => {
  const containerRef = useRef<HTMLDivElement|null>(null); // the width-constrained parent
  const itemRef = useRef<HTMLDivElement|null>(null);       // the row being scaled
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const row = itemRef.current;
    if (!container || !row) return;

    let cancelled = false;

    const fit = () => {
      if (cancelled) return;

      const natural = row.scrollWidth;
      const available = container.clientWidth;
      if (natural <= 0 || available <= 0) return;

      setScale(Math.min(1, available / (natural)));
    };

    fit();

    // One-time re-fit once fonts and images have settled.
    const images = Array.from(row.querySelectorAll("img"));
    Promise.all([
      document.fonts.ready,
      ...images.map((img) => img.decode().catch(() => {})),
      ]).then(fit);

    const observer = new ResizeObserver(fit);
    observer.observe(container);
    observer.observe(row);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "hidden",
      }}>
      <div
        ref={itemRef}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width:(scale === 1) ? '100%': 'max-content',
          whiteSpace: "nowrap",
          transform: `scale(${scale})`,
          transformOrigin: "left center",
          transition: "transform 0.1s ease-out",
          justifyContent:'center',
          ...style
        }}>
        {children}
      </div>
    </div>
  );
};

export default ResizeContainer;