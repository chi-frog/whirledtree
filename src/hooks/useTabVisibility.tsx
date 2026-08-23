'use client';

import { useEffect } from 'react';

type TabVisibilityFunction = ()=>void;
function useTabVisibility({onHidden, onVisible}:{
  onHidden?:TabVisibilityFunction,
  onVisible?:TabVisibilityFunction}) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onHidden?.();
      } else {
        onVisible?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onHidden, onVisible]);
};

export default useTabVisibility;