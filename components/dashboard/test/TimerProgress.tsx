import React, { useEffect, useState, useRef } from 'react';

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
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Grade and Record Challenge
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
