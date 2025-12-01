'use client'

import { useEffect } from "react";

const useMouseLeavePage:(cb:()=>void)=>void = (cb) => {
  useEffect(() => {
    const handleMouseOut = (e:MouseEvent) => {
      if (!e.relatedTarget) {
        cb();
      }
    }

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [cb]);
};

export default useMouseLeavePage;