const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

// Keep Supabase alive — ping every 5 minutes to prevent idle sleep
setInterval(async () => {
  try {
    await supabase.from('users').select('id').limit(1)
  } catch (_) {}
}, 5 * 60 * 1000)

module.exports = { supabase }
