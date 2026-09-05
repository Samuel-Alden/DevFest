import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const loaded = Object.keys(import.meta.env)
    .filter((k) => k.startsWith('VITE_'))
    .map((k) => `${k}=${import.meta.env[k] ? '(set)' : '(empty)'}`)
  console.error(
    '[TriagePeace] Supabase env missing.\n' +
      'Create a .env file next to package.json with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY,\n' +
      'then fully restart `npm run dev`.\n' +
      `VITE_* keys seen: ${loaded.length ? loaded.join(', ') : '(none)'}`,
  )
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. See console. Restart npm run dev after fixing .env.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
