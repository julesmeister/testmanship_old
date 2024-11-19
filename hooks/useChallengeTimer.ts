import { useState, useCallback, useRef, useEffect } from 'react';
import { Challenge } from '@/types/challenge';
import { toast } from 'sonner';

export const useChallengeTimer = (challenge: Challenge | null) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current || !challenge) return;
      
      const now = Date.now();
      const newElapsedTime = Math.floor((now - startTimeRef.current) / 1000);
      const timeAllocationInSeconds = challenge.time_allocation * 60;
      
      if (newElapsedTime >= timeAllocationInSeconds) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setIsTimeUp(true);
        setIsWriting(false);
        setElapsedTime(timeAllocationInSeconds);
        toast("Time's up! Challenge completed.", { 
          duration: 3000,
          className: 'bg-blue-500'
        });
      } else {
        setElapsedTime(newElapsedTime);
      }
    }, 1000);
  }, [challenge]);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsTimeUp(false);
    setElapsedTime(0);
    setIsWriting(false);
    startTimeRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-start timer when challenge changes
  useEffect(() => {
    if (challenge && !isTimeUp) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [challenge, isTimeUp, startTimer]);

  return {
    elapsedTime,
    isTimeUp,
    isWriting,
    startTimer,
    resetTimer,
    setIsWriting
  };
};
