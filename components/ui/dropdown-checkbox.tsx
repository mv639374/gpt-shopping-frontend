import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlatformDisplay, CountryFlag, formatPlatformName, PlatformIcon, getCountryFlag } from '@/utils/platformUtils'

export interface DropdownOption {
  label: string
  value: string
}

interface DropdownCheckboxProps {
  options: DropdownOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxDisplayItems?: number
  filterType?: string // Add filter type to show proper labels
}

export function DropdownCheckbox({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  disabled = false,
  className = "",
  maxDisplayItems = 2,
  filterType
}: DropdownCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map(option => option.value))
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  const isAllSelected = selected.length === options.length
  const isPartialSelected = selected.length > 0 && selected.length < options.length

  const getDisplayText = () => {
    // When disabled, always show placeholder
    if (disabled) {
      return placeholder
    }
    
    if (selected.length === 0) {
      return placeholder
    }
    
    if (selected.length === options.length) {
      return filterType ? `${filterType} (All)` : `All ${options.length} selected`
    }

    if (selected.length <= maxDisplayItems) {
      const selectedLabels = selected
        .map(value => options.find(opt => opt.value === value)?.label)
        .filter(Boolean)
      return selectedLabels.join(', ')
    }

    return filterType ? `${filterType} (${selected.length})` : `${selected.length} selected`
  }

  // Render button content with icons for Platforms and Regions
  const renderButtonContent = () => {
    if (selected.length === 0) {
      return <span className="truncate">{placeholder}</span>
    }

    // For Platforms - show icons
    if (filterType === 'Platforms') {
      const prefix = selected.length === options.length 
        ? `Platforms (All)` 
        : `Platforms (${selected.length}/${options.length})`
      
      const selectedPlatforms = selected
        .map(value => options.find(opt => opt.value === value)?.label)
        .filter((label): label is string => Boolean(label))
        .slice(0, 5) // Show max 5 icons
      
      return (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium flex-shrink-0">{prefix}</span>
          {selectedPlatforms.length > 0 && (
            <div className="flex items-center gap-1 overflow-hidden">
              {selectedPlatforms.map((platform, idx) => (
                <PlatformIcon 
                  key={idx} 
                  platform={platform} 
                  size={16}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    // For Regions - show flag emojis
    if (filterType === 'Regions') {
      const prefix = selected.length === options.length 
        ? `Regions (All)` 
        : `Regions (${selected.length}/${options.length})`
      
      const selectedRegions = selected
        .map(value => options.find(opt => opt.value === value)?.label)
        .filter((label): label is string => Boolean(label))
        .slice(0, 5) // Show max 5 flags
      
      return (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium flex-shrink-0">{prefix}</span>
          {selectedRegions.length > 0 && (
            <div className="flex items-center gap-0.5 overflow-hidden">
              {selectedRegions.map((region, idx) => (
                <span key={idx} className="text-base flex-shrink-0">
                  {getCountryFlag(region)}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }

    // For Intents and Personas - show count with truncated preview
    if (filterType === 'Intents' || filterType === 'Personas' || filterType === 'Sentiments') {
      if (selected.length === options.length) {
        return <span className="truncate">{filterType} (All)</span>
      }
      
      if (selected.length === 1) {
        const selectedLabel = options.find(opt => opt.value === selected[0])?.label
        const maxLength = 25 // Truncate individual labels at 25 characters
        const truncatedLabel = selectedLabel && selectedLabel.length > maxLength 
          ? selectedLabel.substring(0, maxLength) + '...' 
          : selectedLabel
        return <span className="truncate">{truncatedLabel}</span>
      }
      
      // Multiple selections - show count only
      return <span className="truncate">{filterType} ({selected.length})</span>
    }

    // Default text display for other filter types
    return <span className="truncate">{getDisplayText()}</span>
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal",
            selected.length === 0 && "text-muted-foreground",
            className
          )}
        >
          {renderButtonContent()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 sm:w-80 p-0" align="start">
        {/* Header with Select All/Clear All */}
        <div className="flex items-center justify-between p-3 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-md border-2 border-primary transition-all",
                isAllSelected ? "bg-primary text-primary-foreground" : 
                isPartialSelected ? "bg-primary/20" : "bg-background"
              )}>
                {isAllSelected && <Check className="h-3 w-3" />}
                {isPartialSelected && <div className="h-2 w-2 bg-primary rounded-sm" />}
              </div>
              <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
            </button>
          </div>
          {selected.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto px-2 pb-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            // Helper to render label with proper truncation
            const renderLabel = () => {
              const displayLabel = filterType === 'Platforms' ? formatPlatformName(option.label) : option.label
              // For Intents and Personas, use a title attribute for full text on hover
              const maxLength = 50 // Max characters before truncation in dropdown
              
              if ((filterType === 'Intents' || filterType === 'Personas') && displayLabel.length > maxLength) {
                return (
                  <span className="text-sm truncate" title={displayLabel}>
                    {displayLabel}
                  </span>
                )
              }
              
              return (
                <span className="text-sm truncate">
                  {displayLabel}
                </span>
              )
            }
            
            return (
              <div
                key={option.value}
                className="flex items-center space-x-3 px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                onClick={() => handleToggleOption(option.value)}
              >
                <div className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-md border-2 border-primary transition-all flex-shrink-0",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-background"
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {filterType === 'Platforms' && (
                    <PlatformDisplay platform={option.label} size={32} showText={false} />
                  )}
                  {filterType === 'Regions' && (
                    <CountryFlag country={option.label} />
                  )}
                  {renderLabel()}
                </div>
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
