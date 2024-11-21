import { create } from 'zustand';

interface TestState {
  showChallenges: boolean;
  showEvaluation: boolean;
  idleTimer: number | null;
  setShowChallenges: (show: boolean) => void;
  setShowEvaluation: (show: boolean) => void;
  setIdleTimer: (time: number | null) => void;
  startChallenge: () => void;
  resetState: () => void;
}

export const useTestState = create<TestState>((set) => ({
  showChallenges: false,
  showEvaluation: false,
  idleTimer: null,
  setShowChallenges: (show) => set({ showChallenges: show }),
  setShowEvaluation: (show) => set({ showEvaluation: show }),
  setIdleTimer: (time) => set({ idleTimer: time }),
  startChallenge: () => set({ 
    showChallenges: false, 
    showEvaluation: false, 
    idleTimer: 20 
  }),
  resetState: () => set({ 
    showChallenges: false, 
    showEvaluation: false, 
    idleTimer: null 
  }),
}));
