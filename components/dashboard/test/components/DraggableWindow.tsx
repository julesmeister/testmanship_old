import { HiSparkles, HiXMark } from 'react-icons/hi2';
import { useDraggable } from '@/hooks/useDraggable';
import { useResizable } from '@/hooks/useResizable';

interface DraggableWindowProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function DraggableWindow({ children, onClose }: DraggableWindowProps) {
  const initialWidth = 400;
  const padding = 100;
  
  // Calculate initial position from the right side of the screen
  const getInitialX = () => {
    if (typeof window === 'undefined') return padding;
    // Subtract the initial width to ensure the window is fully visible
    return window.innerWidth - initialWidth - padding;
  };

  const getInitialHeight = () => {
    if (typeof window === 'undefined') return 500;
    return Math.floor(window.innerHeight / 2);
  };

  const { dragProps, isDragging } = useDraggable({
    initialPosition: { 
      x: getInitialX(),
      y: padding 
    }
  });

  const { size, resizeProps, containerStyle } = useResizable({
    initialSize: { 
      width: initialWidth, 
      height: getInitialHeight()
    },
    minWidth: 300,
    minHeight: 200,
    maxWidth: 800,
    maxHeight: typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.8) : 500
  });

  return (
    <div 
      {...dragProps}
      style={{
        ...dragProps.style,
        width: containerStyle.width,
        height: containerStyle.height,
        position: 'fixed',
        maxWidth: `calc(100vw - ${padding * 2}px)`,
        zIndex: 50
      }}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg transition-all relative"
    >
      <div 
        className="window-handle cursor-grab active:cursor-grabbing bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 p-2.5 rounded-t-lg flex items-center justify-between select-none"
      >
        <h2 className="font-medium text-sm text-white/90 flex items-center gap-1.5">
          <HiSparkles className="w-4 h-4" />
          AI Writing Assistant
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:text-white/90 hover:bg-white/10 transition-colors"
          >
            <HiXMark className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-3 overflow-y-auto" style={{ height: 'calc(100% - 41px)' }}>
        {children}
      </div>
      <div {...resizeProps} className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize hover:bg-zinc-200/20 rounded-bl" />
    </div>
  );
}
