import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/db.types';

// Better put your these secret keys in .env file
export default createClient<Database>(config.supabaseUrl, config.supabaseKey, {
  auth: {
    // web don't need to set storage since that's using the browser by default
    autoRefreshToken: true,
    persistSession: true,
  },
});
