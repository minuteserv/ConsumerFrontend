/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for backend database operations.
 * The API key is safe to use in the browser as long as Row Level Security (RLS)
 * is properly configured on your Supabase tables.
 */

import { createClient } from '@supabase/supabase-js';

const getRequiredEnvVar = (key, description = '') => {
  const value = import.meta.env[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  const details = description ? ` ${description}` : '';
  throw new Error(
    `[Config] Missing required environment variable ${key}.${details} Please add it to your .env file before building or running the app.`
  );
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: getRequiredEnvVar('VITE_SUPABASE_URL', 'This is your Supabase project URL.'),
  anonKey: getRequiredEnvVar('VITE_SUPABASE_ANON_KEY', 'This is your Supabase anon key.'),
};

// Create and export Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

/**
 * Usage Example:
 * 
 * import { supabase } from '@/lib/supabase';
 * 
 * // Insert data
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .insert([{ column: 'value' }]);
 * 
 * // Select data
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .select('*');
 * 
 * // Update data
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .update({ column: 'new_value' })
 *   .eq('id', 1);
 * 
 * // Delete data
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .delete()
 *   .eq('id', 1);
 */

