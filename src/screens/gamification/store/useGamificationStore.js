"use strict";
// src/gamification/store/useGamificationStore.ts
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGamificationStore = void 0;
var zustand_1 = require("zustand");
var constants_1 = require("../engine/constants");
/**
 * The global Zustand store for managing the user's gamification state.
 *
 * It's initialized with a default state and provides actions to update it.
 * The UI will reactively update whenever this state changes.
 */
exports.useGamificationStore = (0, zustand_1.create)(function (set) { return ({
    // Default Initial State
    level: 1,
    xp: 0,
    xpForNextLevel: 100, // Initial value, will be calculated
    prestigeTier: constants_1.PRESTIGE_TIERS[0], // 'White' tier
    currentStreak: 0,
    achievements: [],
    pendingAchievement: null,
    // Actions
    setState: function (newState) { return set(function (state) { return (__assign(__assign({}, state), newState)); }); },
    setPendingAchievement: function (achievement) { return set({ pendingAchievement: achievement }); },
    clearPendingAchievement: function () { return set({ pendingAchievement: null }); },
}); });
