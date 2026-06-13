"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
require("react-native-url-polyfill/auto");
var async_storage_1 = require("@react-native-async-storage/async-storage");
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = 'https://qwooderddfexkxvhwigw.supabase.co';
var supabaseAnonKey = 'sb_publishable_H_WrUJS3UUTOr40xjB064w_g6PqAJRx';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: async_storage_1.default,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
