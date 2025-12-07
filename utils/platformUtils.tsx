import React, { useState } from 'react'

// Helper function to generate icon URL from domain using Google's favicon API
export const getIconUrlFromDomain = (domain: string | null | undefined): string | null => {
  if (!domain) return null
  
  try {
    // Remove protocol and www if present, and clean up domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim()
    if (!cleanDomain) return null
    
    return `https://s2.googleusercontent.com/s2/favicons?domain=${cleanDomain}&sz=64`
  } catch (error) {
    console.warn('Error generating icon URL for domain:', domain, error)
    return null
  }
}

// Platform icon mapping
const platformIconMap: Record<string, string> = {
  'chatgpt': '/chatgpt.svg',
  'copilot': '/copilot.png',
  'gemini': '/gemini.png',
  'google-ai': '/google-ai.png',
  'grok': '/grok.png',
  'meta-ai': '/meta-ai.png',
  'perplexity': '/perplexity.png',
  'you': '/you.png', // You.com search engine
  // Add fallback for any other platforms that might use similar icons
  'claude': '/chatgpt.svg', // Using ChatGPT as fallback until we have Claude icon
  'huggingface': '/gemini.png', // Using Gemini as fallback
  'cohere': '/google-ai.png', // Using Google AI as fallback
}

// Platform name normalization (handles different variations)
const normalizePlatformName = (platform: string): string => {
  const normalized = platform.toLowerCase().trim().replace(/_/g, '-')
  
  // Handle variations
  const variations: Record<string, string> = {
    'chat-gpt': 'chatgpt',
    'openai': 'chatgpt',
    'gpt': 'chatgpt',
    'github-copilot': 'copilot',
    'microsoft-copilot': 'copilot',
    'google-ai-studio': 'google-ai',
    'google-ai-mode': 'google-ai',
    'google-ai': 'google-ai',
    'bard': 'gemini',
    'google-gemini': 'gemini',
    'x-ai': 'grok',
    'xai': 'grok',
    'meta-llama': 'meta-ai',
    'meta-ai': 'meta-ai',
    'llama': 'meta-ai',
    'perplexity-ai': 'perplexity',
    'anthropic': 'claude',
    'claude-3': 'claude',
    'hugging-face': 'huggingface',
    'together-ai': 'cohere',
    'together': 'cohere',
    'open-router': 'cohere',
    'openrouter': 'cohere',
    
    // Bright Data AI Model variations (with and without AIModel prefix)
    'aimodel.google-ai-mode-bright-data': 'google-ai',
    'google-ai-mode-bright-data': 'google-ai',
    'aimodel.meta-ai-bright-data': 'meta-ai',
    'meta-ai-bright-data': 'meta-ai',
    'aimodel.perplexity-bright-data': 'perplexity',
    'perplexity-bright-data': 'perplexity',
    'aimodel.chatgpt-bright-data': 'chatgpt',
    'chatgpt-bright-data': 'chatgpt',
    'aimodel.copilot-bright-data': 'copilot',
    'copilot-bright-data': 'copilot',
    'aimodel.grok-bright-data': 'grok',
    'grok-bright-data': 'grok',
  }
  
  return variations[normalized] || normalized
}

// Get platform icon path
export const getPlatformIcon = (platform: string): string | null => {
  const normalized = normalizePlatformName(platform)
  return platformIconMap[normalized] || null
}

// Platform icon component
interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
  fallback?: React.ReactNode
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  platform, 
  size = 16, 
  className = '',
  fallback 
}) => {
  const [imageError, setImageError] = useState(false)
  const iconPath = getPlatformIcon(platform)
  
  // Reset error state when platform changes
  React.useEffect(() => {
    setImageError(false)
  }, [platform])
  
  // Debug logging removed - keeping only edge function related logs
  
  // Show fallback if no icon path or image failed to load
  if (!iconPath || imageError) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Default fallback: a simple rounded square with first letter
    const firstLetter = platform.charAt(0).toUpperCase()
    return (
      <div 
        className={`inline-flex items-center justify-center rounded bg-muted text-muted-foreground font-medium text-xs ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.5) }}
        title={`${platform} (fallback icon)`}
      >
        {firstLetter}
      </div>
    )
  }
  
  // Define platforms that need color inversion in dark mode (black logos)
  const normalizedPlatform = normalizePlatformName(platform)
  const needsInversion = ['chatgpt', 'grok', 'claude']
  const shouldInvert = needsInversion.includes(normalizedPlatform)
  
  return (
    <img 
      src={iconPath} 
      alt={platform} 
      width={size} 
      height={size}
      className={`inline-block ${shouldInvert ? 'dark:invert' : ''} ${className}`}
      onError={(e) => {
        console.warn(`Failed to load icon for platform "${platform}" at path "${iconPath}"`)
        setImageError(true)
      }}
    />
  )
}

// Country flag emoji mapping
const countryFlagMap: Record<string, string> = {
  // Major countries
  'India': '🇮🇳',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'US': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Brazil': '🇧🇷',
  'Russia': '🇷🇺',
  'South Korea': '🇰🇷',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Netherlands': '🇳🇱',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
  'Portugal': '🇵🇹',
  'Ireland': '🇮🇪',
  'New Zealand': '🇳🇿',
  'Singapore': '🇸🇬',
  'Hong Kong': '🇭🇰',
  'South Africa': '🇿🇦',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Israel': '🇮🇱',
  'Turkey': '🇹🇷',
  'UAE': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Egypt': '🇪🇬',
  'Thailand': '🇹🇭',
  'Malaysia': '🇲🇾',
  'Indonesia': '🇮🇩',
  'Philippines': '🇵🇭',
  'Vietnam': '🇻🇳',
  'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩',
  'Sri Lanka': '🇱🇰',
  'Nepal': '🇳🇵',
  'Myanmar': '🇲🇲',
  
  // Regions/continents (using representative flags or emojis)
  'Europe': '🇪🇺',
  'Asia': '🌏',
  'North America': '🌎',
  'South America': '🌎',
  'Africa': '🌍',
  'Oceania': '🌏',
  'Middle East': '🌍',
  
  // Default fallback
  'Global': '🌍',
  'International': '🌍',
  'Worldwide': '🌍',
}

// Get country flag emoji
export const getCountryFlag = (country: string): string => {
  const normalized = country.trim()
  return countryFlagMap[normalized] || '🌍' // Default to globe emoji
}

// Country flag component
interface CountryFlagProps {
  country: string
  className?: string
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ country, className = '' }) => {
  const flag = getCountryFlag(country)
  return <span className={`inline-block ${className}`}>{flag}</span>
}

// Combined region-platform display component
interface RegionPlatformDisplayProps {
  region: string
  platform: string
  showCount?: boolean
  count?: number
  size?: number
  className?: string
}

export const RegionPlatformDisplay: React.FC<RegionPlatformDisplayProps> = ({
  region,
  platform,
  showCount = false,
  count,
  size = 16,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CountryFlag country={region} />
      <PlatformIcon platform={platform} size={size} />
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  )
}

// Utility to format platform name for display
export const formatPlatformName = (platform: string): string => {
  const originalPlatform = platform.toLowerCase().trim()
  
  // Debug logging removed - keeping only edge function related logs
  
  // Direct mapping for common platform variations
  const displayNameMap: Record<string, string> = {
    // ChatGPT variations
    'chatgpt': 'ChatGPT',
    'chat-gpt': 'ChatGPT',
    'chat_gpt': 'ChatGPT',
    'openai': 'ChatGPT',
    'gpt': 'ChatGPT',
    
    // Copilot variations  
    'copilot': 'Copilot',
    'microsoft-copilot': 'Microsoft Copilot',
    'microsoft_copilot': 'Microsoft Copilot',
    'github-copilot': 'GitHub Copilot',
    'github_copilot': 'GitHub Copilot',
    
    // Google AI variations
    'google-ai': 'Google AI',
    'google_ai': 'Google AI',
    'google-ai-studio': 'Google AI Studio',
    'google_ai_studio': 'Google AI Studio',
    'google-ai-mode': 'Google AI Mode',
    'google_ai_mode': 'Google AI Mode',
    'bard': 'Google Bard',
    
    // Gemini variations
    'gemini': 'Gemini',
    'google-gemini': 'Google Gemini',
    'google_gemini': 'Google Gemini',
    
    // Grok variations
    'grok': 'Grok',
    'x-ai': 'Grok (xAI)',
    'x_ai': 'Grok (xAI)',
    'xai': 'Grok (xAI)',
    
    // Meta AI variations
    'meta-ai': 'Meta AI',
    'meta_ai': 'Meta AI',
    'meta-llama': 'Meta AI (Llama)',
    'meta_llama': 'Meta AI (Llama)',
    'llama': 'Meta AI (Llama)',
    
    // Perplexity variations
    'perplexity': 'Perplexity',
    'perplexity-ai': 'Perplexity AI',
    'perplexity_ai': 'Perplexity AI',
    
     // Claude variations
     'claude': 'Claude',
     'anthropic': 'Claude (Anthropic)',
     'claude-3': 'Claude 3',
     'claude_3': 'Claude 3',

     // You.com variations
     'you': 'You.com',

     // Additional AI platforms
    'huggingface': 'Hugging Face',
    'hugging-face': 'Hugging Face',
    'hugging_face': 'Hugging Face',
    'cohere': 'Cohere',
    'together': 'Together AI',
    'together-ai': 'Together AI',
    'together_ai': 'Together AI',
    'replicate': 'Replicate',
    'openrouter': 'OpenRouter',
    'open-router': 'OpenRouter',
    'open_router': 'OpenRouter',

    // Bright Data AI Model variations (with AIModel prefix)
    'aimodel.google-ai-mode-bright-data': 'Google AI',
    'aimodel.google_ai_mode_bright_data': 'Google AI',
    'aimodel.meta-ai-bright-data': 'Meta AI',
    'aimodel.meta_ai_bright_data': 'Meta AI',
    'aimodel.perplexity-bright-data': 'Perplexity',
    'aimodel.perplexity_bright_data': 'Perplexity',
    'aimodel.chatgpt-bright-data': 'ChatGPT',
    'aimodel.chatgpt_bright_data': 'ChatGPT',
    'aimodel.copilot-bright-data': 'Copilot',
    'aimodel.copilot_bright_data': 'Copilot',
    'aimodel.grok-bright-data': 'Grok',
    'aimodel.grok_bright_data': 'Grok',

    // Bright Data AI Model variations (without AIModel prefix)
    'google-ai-mode-bright-data': 'Google AI',
    'google_ai_mode_bright_data': 'Google AI',
    'meta-ai-bright-data': 'Meta AI',
    'meta_ai_bright_data': 'Meta AI',
    'perplexity-bright-data': 'Perplexity',
    'perplexity_bright_data': 'Perplexity',
    'chatgpt-bright-data': 'ChatGPT',
    'chatgpt_bright_data': 'ChatGPT',
    'copilot-bright-data': 'Copilot',
    'copilot_bright_data': 'Copilot',
    'grok-bright-data': 'Grok',
    'grok_bright_data': 'Grok',
  }
  
  // Check direct mapping first
  if (displayNameMap[originalPlatform]) {
    const result = displayNameMap[originalPlatform]
    return result
  }
  
  // Fallback: capitalize first letter and replace underscores/hyphens with spaces
  const result = platform
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return result
}

// Enhanced platform display with icon and formatted name
interface PlatformDisplayProps {
  platform: string
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

export const PlatformDisplay: React.FC<PlatformDisplayProps> = ({
  platform,
  size = 16,
  className = '',
  showText = true,
  textClassName = ''
}) => {
  const formattedName = formatPlatformName(platform)
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PlatformIcon platform={platform} size={size} />
      {showText && <span className={textClassName}>{formattedName}</span>}
    </div>
  )
}

export default {
  PlatformIcon,
  CountryFlag,
  RegionPlatformDisplay,
  PlatformDisplay,
  getPlatformIcon,
  getCountryFlag,
  formatPlatformName,
}
