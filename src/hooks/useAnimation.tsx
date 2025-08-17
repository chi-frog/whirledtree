'use client'

import { useEffect, useRef, useState } from "react";
import { Dimension } from "./useFont"

function useAnimation(valueFunctions:(() => number)[], dependencies:any[]) {
  const [values, setValues] = useState<number[]>(valueFunctions.map((_func) => _func()));
  const targetValues = valueFunctions.map((_func) => _func())
  const animationRef = useRef(0);

  useEffect(() => {
        cancelAnimationFrame(animationRef.current);
    
        let start:number;
        const duration = 100;
        const initialValues = values;
    
        function animate(time:number) {
          if (!start) start = time;
    
          const progress = Math.min((time-start) / duration, 1);
    
          setValues(initialValues.map((_initialValue, _index) =>
            _initialValue + (targetValues[_index]-_initialValue)*progress));
    
          if (progress < 1)
            animationRef.current = requestAnimationFrame(animate);
        }
    
        animationRef.current = requestAnimationFrame(animate);
    
        return () => cancelAnimationFrame(animationRef.current);
      }, dependencies);

  return [...values] as const;
}

export default useAnimation;