import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface TimerProgressProps {
  timeElapsed: number;
  timeAllocation: number;
  mode: 'practice' | 'exam';
  onGradeChallenge?: () => void;
}

export default function TimerProgress({ timeElapsed, timeAllocation, mode, onGradeChallenge }: TimerProgressProps) {
  const [fillWidth, setFillWidth] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const isTimeUp = timeElapsed >= timeAllocation * 60;

  // Handle initial fill animation
  useEffect(() => {
    if (timeElapsed === 0) {
      setFillWidth(0);
      const startTime = performance.now();
      startTimeRef.current = startTime;

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = currentTime - startTimeRef.current;
        const duration = 1000; // 1 second animation
        
        if (elapsed < duration) {
          const progress = elapsed / duration;
          setFillWidth(progress * 100);
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setFillWidth(100);
          startTimeRef.current = undefined;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timeElapsed]);

  // Calculate progress percentage (inverted since we want it to drain)
  const progress = Math.max(0, 100 - (timeElapsed / (timeAllocation * 60)) * 100);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const remainingSeconds = Math.max(0, (timeAllocation * 60) - seconds);
    const minutes = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const actualWidth = timeElapsed === 0 ? fillWidth : progress;
  const backgroundColor = mode === 'exam' ? '#2563eb' : '#059669';

  if (isTimeUp) {
    return (
      <button
        onClick={onGradeChallenge}
        className="group relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg transition-all overflow-hidden w-full h-12 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        {/* Subtle background color */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-violet-50 dark:from-violet-950/30 dark:via-fuchsia-950/30 dark:to-violet-950/30 opacity-80" />
        
        {/* Always visible gradient border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-100 animate-gradient-x">
          <div className="absolute inset-[1px] bg-white/80 dark:bg-zinc-900/80 rounded-lg backdrop-blur-sm" />
        </div>
        
        {/* Content with hover effects */}
        <span className="relative z-10 transform transition-transform duration-200">
          Grade and Record Challenge
        </span>
        <CheckCircle 
          className="relative z-10 h-5 w-5 transform group-hover:scale-110 transition-all duration-200 text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300" 
        />
      </button>
    );
  }

  return (
    <div className="relative w-full h-12 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-700">
      {/* Progress bar */}
      <div 
        className="absolute inset-0 transition-[width] duration-1000"
        style={{
          width: `${actualWidth}%`,
          backgroundColor,
          transition: timeElapsed === 0 ? 'width 1s ease-out' : 'width 1s linear'
        }}
      />
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-4 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-sm">
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            {mode === 'exam' ? 'Exam' : 'Practice'} Mode - {formatTimeRemaining(timeElapsed)} remaining
          </span>
        </div>
      </div>
    </div>
  );
}
