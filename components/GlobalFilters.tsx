import { useEffect } from 'react'
import { useGlobalFilterStore } from '@/store/globalFilterStore'
import { DEFAULT_DATE_RANGES } from '@/types/date'

export function GlobalFilters() {
  const {
    filters,
    availableOptions,
    setRegions,
    setPlatforms,
    setDateRange,
    setSelectedPreset,
    setAvailableOptions,
    selectAllRegions,
    selectAllPlatforms,
  } = useGlobalFilterStore()

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        
        // Fetch regions
        const regionsResponse = await fetch(`${apiUrl}/analytics/regions`)
        const regionsData = await regionsResponse.json()
        
        // Fetch platforms
        const platformsResponse = await fetch(`${apiUrl}/analytics/platforms`)
        const platformsData = await platformsResponse.json()
        
        setAvailableOptions({
          regions: regionsData,
          platforms: platformsData,
          topics: []
        })
        
        // Select all by default
        if (filters.regions.length === 0) {
          setRegions(regionsData)
        }
        if (filters.platforms.length === 0) {
          setPlatforms(platformsData)
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }

    fetchFilterOptions()
  }, [])

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    setDateRange(DEFAULT_DATE_RANGES[preset as keyof typeof DEFAULT_DATE_RANGES])
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Filters</h3>
      
      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <select
          value={filters.selectedPreset || 'last30days'}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="last90days">Last 90 Days</option>
        </select>
      </div>

      {/* Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Regions ({filters.regions.length} selected)
        </label>
        <div className="flex gap-2 mb-2">
          <button
            onClick={selectAllRegions}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            onClick={() => setRegions([])}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 space-y-1">
          {availableOptions.regions.map((region) => (
            <label key={region} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.regions.includes(region)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRegions([...filters.regions, region])
                  } else {
                    setRegions(filters.regions.filter(r => r !== region))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platforms ({filters.platforms.length} selected)
        </label>
        <div className="flex gap-2 mb-2">
          <button
            onClick={selectAllPlatforms}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            onClick={() => setPlatforms([])}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2 space-y-1">
          {availableOptions.platforms.map((platform) => (
            <label key={platform} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.platforms.includes(platform)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPlatforms([...filters.platforms, platform])
                  } else {
                    setPlatforms(filters.platforms.filter(p => p !== platform))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
