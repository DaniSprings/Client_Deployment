import { useEffect, useState } from 'react';

const DEFAULT_SIZE = {
  width: 0,
  height: 0,
};

function getWindowSize() {
  if (typeof window === 'undefined') {
    return DEFAULT_SIZE;
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(() => getWindowSize());

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}
