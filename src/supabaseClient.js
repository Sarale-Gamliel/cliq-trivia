import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knpvjzcytfqxkfdoaoyj.supabase.co'
const supabaseKey = 'sb_publishable_TOvEqgoT0pzy_HQRel1GHw_3pN8x8-H'

export const supabase = createClient(supabaseUrl, supabaseKey)