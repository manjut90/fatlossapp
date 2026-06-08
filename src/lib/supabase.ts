import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  'https://qwooderddfexkxvhwigw.supabase.co';

const supabaseAnonKey =
  'sb_publishable_H_WrUJS3UUTOr40xjB064w_g6PqAJRx';

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey,
  );