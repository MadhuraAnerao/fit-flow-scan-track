// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qpcertsfswurkzcfqtpg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwY2VydHNmc3d1cmt6Y2ZxdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDMxMjAsImV4cCI6MjA1OTUxOTEyMH0.YxggKSLZzbEEyMLE4AXnkv0mSJTY0uefGxeQX9qCQjo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);