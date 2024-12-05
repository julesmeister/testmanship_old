import { useEffect, useRef, useState } from 'react';

export function useTextFit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState('sm');

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;

      const isOverflowing = text.offsetHeight > container.offsetHeight;
      setFontSize(isOverflowing ? 'xs' : 'sm');
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { containerRef, textRef, fontSize };
}
