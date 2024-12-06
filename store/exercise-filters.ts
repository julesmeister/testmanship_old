import { create } from 'zustand'
import type { DifficultyLevel } from '@/types/difficulty'

interface ExerciseFiltersState {
  selectedLevel: DifficultyLevel | null
  selectedTopic: string | null
  setSelectedLevel: (level: DifficultyLevel | null) => void
  setSelectedTopic: (topic: string | null) => void
  resetFilters: () => void
}

export const useExerciseFilters = create<ExerciseFiltersState>((set) => ({
  selectedLevel: null,
  selectedTopic: null,
  setSelectedLevel: (level) => set({ selectedLevel: level, selectedTopic: null }), // Reset topic when level changes
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  resetFilters: () => set({ selectedLevel: null, selectedTopic: null })
}))
