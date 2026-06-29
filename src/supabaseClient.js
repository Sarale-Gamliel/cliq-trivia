import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knpvjzcytfqxkfdoaoyj.supabase.co'
const supabaseKey = 'sb_publishable_IzmkkdT9Nu9X6-lP468U7w_FQqc_CHc'

export const supabase = createClient(supabaseUrl, supabaseKey)