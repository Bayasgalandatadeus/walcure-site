import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ngmzvmgsddiemeznmvoh.supabase.co'
const SUPABASE_KEY = 'sb_publishable_VIO-91cj_hjORjt1OgTd_A_zJnE9GrJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
