import { useState, useCallback, useEffect } from 'react';

interface Size {
  width: number;
  height: number;
}

interface UseResizableProps {
  initialSize?: Size;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useResizable({
  initialSize = { width: 300, height: 400 },
  minWidth = 300,
  minHeight = 200,
  maxWidth = 800,
  maxHeight = 800
}: UseResizableProps = {}) {
  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dragging when resizing
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.min(Math.max(
        resizeStart.width + (e.clientX - resizeStart.x),
        minWidth
      ), maxWidth);
      
      const newHeight = Math.min(Math.max(
        resizeStart.height + (e.clientY - resizeStart.y),
        minHeight
      ), maxHeight);

      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  }, [isResizing, resizeStart, minWidth, minHeight, maxWidth, maxHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    size,
    isResizing,
    resizeProps: {
      onMouseDown: handleResizeStart,
      style: {
        cursor: 'nw-resize',
        position: 'absolute' as const,
        right: -5,
        bottom: -5,
        width: 10,
        height: 10,
        backgroundColor: 'transparent',
        zIndex: 51
      }
    },
    containerStyle: {
      width: size.width,
      height: size.height
    }
  };
}
