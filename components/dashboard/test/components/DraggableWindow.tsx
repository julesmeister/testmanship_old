import { HiSparkles, HiXMark } from 'react-icons/hi2';
import { useDraggable } from '@/hooks/useDraggable';

interface DraggableWindowProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function DraggableWindow({ children, onClose }: DraggableWindowProps) {
  const { dragProps, isDragging } = useDraggable({
    initialPosition: { x: 20, y: 20 }
  });

  return (
    <div 
      {...dragProps}
      style={{
        position: 'fixed',
        top: dragProps.style?.top || 20,
        left: dragProps.style?.left || 20,
        zIndex: 50,
      }}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg min-w-[300px] max-w-[500px] transition-all"
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
      <div className="p-3 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
