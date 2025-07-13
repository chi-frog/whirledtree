// hooks/use-page-visibility.js
'use client'

import { useState, useLayoutEffect } from 'react'

function usePageVisibility() {
  const [isPageVisible, setIsPageVisible] = useState(false);

  useLayoutEffect(() => setIsPageVisible(!document.hidden), []);

  useLayoutEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(!document.hidden);
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return { isPageVisible }
}

export default usePageVisibility