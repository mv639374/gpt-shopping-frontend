import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || ''

export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export type { SupabaseClient } from '@supabase/supabase-js'
