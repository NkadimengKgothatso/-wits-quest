import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { WebSocket } from 'ws';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[DB] Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket as any,
  },
});
