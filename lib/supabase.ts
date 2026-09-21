import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Substitua pelas chaves do seu projeto no Supabase (Project Settings > API)
const SUPABASE_URL = 'https://sfmnfbpcuiyzylohkrtu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbW5mYnBjdWl5enlsb2hrcnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTcwNjksImV4cCI6MjEwMzkzMzA2OX0.N61EW_dhcjP4QyWoxdF3C8RrUx-3MgHzUcVP6ecxV-8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

