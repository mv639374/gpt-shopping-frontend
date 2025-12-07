import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type DateRange, DEFAULT_DATE_RANGES } from '@/types/date'

export interface GlobalFilters {
  regions: string[]
  platforms: string[]
  topics: string[]
  dateRange?: DateRange
  selectedPreset?: string | null
}

interface GlobalFilterStore {
  filters: GlobalFilters
  availableOptions: {
    regions: string[]
    platforms: string[]
    topics: { id: string; name: string }[]
  }
  setRegions: (regions: string[]) => void
  setPlatforms: (platforms: string[]) => void
  setTopics: (topics: string[]) => void
  setDateRange: (dateRange: DateRange) => void
  setSelectedPreset: (preset: string | null) => void
  setFilters: (filters: Partial<GlobalFilters>) => void
  setAvailableOptions: (options: Partial<GlobalFilterStore['availableOptions']>) => void
  selectAllRegions: () => void
  selectAllPlatforms: () => void
  selectAllTopics: () => void
  clearAllFilters: () => void
  getActiveFiltersCount: () => number
}

const initialFilters: GlobalFilters = {
  regions: [],
  platforms: [],
  topics: [],
  dateRange: DEFAULT_DATE_RANGES.last30days
}

export const useGlobalFilterStore = create<GlobalFilterStore>()(
  persist(
    (set, get) => ({
      filters: initialFilters,
      availableOptions: {
        regions: [],
        platforms: [],
        topics: []
      },
      setRegions: (regions: string[]) =>
        set((state) => ({
          filters: { ...state.filters, regions }
        })),
      setPlatforms: (platforms: string[]) =>
        set((state) => ({
          filters: { ...state.filters, platforms }
        })),
      setTopics: (topics: string[]) =>
        set((state) => ({
          filters: { ...state.filters, topics }
        })),
      setDateRange: (dateRange: DateRange) =>
        set((state) => ({
          filters: { ...state.filters, dateRange }
        })),
      setSelectedPreset: (preset: string | null) =>
        set((state) => ({
          filters: { ...state.filters, selectedPreset: preset }
        })),
      setFilters: (newFilters: Partial<GlobalFilters>) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),
      setAvailableOptions: (options: Partial<GlobalFilterStore['availableOptions']>) =>
        set((state) => ({
          availableOptions: { ...state.availableOptions, ...options }
        })),
      selectAllRegions: () =>
        set((state) => ({
          filters: { ...state.filters, regions: state.availableOptions.regions }
        })),
      selectAllPlatforms: () =>
        set((state) => ({
          filters: { ...state.filters, platforms: state.availableOptions.platforms }
        })),
      selectAllTopics: () =>
        set((state) => ({
          filters: { ...state.filters, topics: state.availableOptions.topics.map(t => t.id) }
        })),
      clearAllFilters: () => set({ filters: initialFilters }),
      getActiveFiltersCount: () => {
        const { filters, availableOptions } = get()
        let count = 0
        if (filters.regions.length > 0 && filters.regions.length < availableOptions.regions.length) count++
        if (filters.platforms.length > 0 && filters.platforms.length < availableOptions.platforms.length) count++
        if (filters.topics.length > 0 && filters.topics.length < availableOptions.topics.length) count++
        return count
      }
    }),
    {
      name: 'global-filter-store',
      partialize: (state) => ({
        filters: state.filters,
        availableOptions: state.availableOptions
      }),
    }
  )
)
