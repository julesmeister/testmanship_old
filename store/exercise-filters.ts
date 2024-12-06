import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DifficultyLevel } from '@/types/difficulty'

interface ExerciseFiltersState {
  selectedLevel: DifficultyLevel | null
  selectedTopic: string | null
  setSelectedLevel: (level: DifficultyLevel | null) => void
  setSelectedTopic: (topic: string | null) => void
  resetFilters: () => void
}

export const useExerciseFilters = create<ExerciseFiltersState>()(
  persist(
    (set) => ({
      selectedLevel: null,
      selectedTopic: null,
      setSelectedLevel: (level) => set({ selectedLevel: level }), // Don't reset topic here
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),
      resetFilters: () => set({ selectedLevel: null, selectedTopic: null })
    }),
    {
      name: 'exercise-filters-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedLevel: state.selectedLevel,
        selectedTopic: state.selectedTopic
      })
    }
  )
)
