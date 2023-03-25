import { createClient } from '@supabase/supabase-js';

// Better put your these secret keys in .env file
export default createClient(
  process.env.SUPABASE_URL ?? 'https://timivqgbqdzzfcieeokt.supabase.co',
  process.env.SUPABASE_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWl2cWdicWR6emZjaWVlb2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk3MjY3MTgsImV4cCI6MTk5NTMwMjcxOH0.NvoSC1Cki2wE4y6yz_EMxW44Tx1JRqHvuePGGBrZM9Q',
  {
    auth: {
      // web don't need to set storage since that's using the browser by default
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
