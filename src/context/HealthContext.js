"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthProvider = HealthProvider;
exports.useHealth = useHealth;
var react_1 = require("react");
var supabase_1 = require("../services/supabase");
var food_1 = require("../services/food");
var activity_1 = require("../services/activity");
var hydration_1 = require("../services/hydration");
var sleep_1 = require("../services/sleep");
var xp_1 = require("../services/xp");
var streaks_1 = require("../services/streaks");
var calculateDailyScore_1 = require("../utils/calculateDailyScore");
var levels_1 = require("../constants/levels");
var HealthContext = (0, react_1.createContext)(null);
var XP_PER_CHECKIN = {
    food: 12,
    water: 5,
    activity: 20,
    sleep: 10,
};
var DEFAULT_HEALTH_DATA = {
    todayCalories: 0,
    todayProtein: 0,
    todayCarbs: 0,
    todayFats: 0,
    todayFiber: 0,
    todayWater: 0,
    todayWorkout: false,
    todaySleep: 0,
    todayCaloriesBurned: 0,
    dailyScore: 0,
    xp: 0,
    totalXp: 0,
    level: 1,
    streak: 0,
    timeline: [],
};
function HealthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = (0, react_1.useState)(DEFAULT_HEALTH_DATA), healthData = _b[0], setHealthData = _b[1];
    var _c = (0, react_1.useState)(false), initialized = _c[0], setInitialized = _c[1];
    var _d = (0, react_1.useState)(null), pendingLevelUp = _d[0], setPendingLevelUp = _d[1];
    var previousXPRef = (0, react_1.useRef)(null);
    // ==========================================
    // LOAD TODAY'S REAL DATA FROM SUPABASE
    // ==========================================
    var loadTodayData = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, user, userError, userId, start, startISO, _b, foodResult, waterResult, sleepResult, activityResult, progressResult, xpResult, todayCalories, todayProtein, todayCarbs, todayFats, todayFiber, todayWater, todaySleep, todayWorkout, todayCaloriesBurned, streak, totalXp, xp, dailyScore, levelInfo, newHealthData, err_1;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
        return __generator(this, function (_5) {
            switch (_5.label) {
                case 0:
                    _5.trys.push([0, 3, 4, 5]);
                    return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 1:
                    _a = _5.sent(), user = _a.data.user, userError = _a.error;
                    if (userError || !(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    userId = user.id;
                    start = new Date();
                    start.setHours(0, 0, 0, 0);
                    startISO = start.toISOString();
                    return [4 /*yield*/, Promise.all([
                            supabase_1.supabase
                                .from('food_logs')
                                .select('calories, protein, carbs, fats, fiber')
                                .eq('user_id', userId)
                                .gte('created_at', startISO),
                            supabase_1.supabase
                                .from('hydration_logs')
                                .select('amount')
                                .eq('user_id', userId)
                                .gte('created_at', startISO),
                            supabase_1.supabase
                                .from('sleep_logs')
                                .select('hours')
                                .eq('user_id', userId)
                                .gte('created_at', startISO)
                                .order('created_at', { ascending: false })
                                .limit(1),
                            supabase_1.supabase
                                .from('activity_logs')
                                .select('calories_burned')
                                .eq('user_id', userId)
                                .gte('created_at', startISO),
                            supabase_1.supabase
                                .from('user_progress')
                                .select('streak,xp,last_celebrated_level')
                                .eq('user_id', userId)
                                .maybeSingle(),
                            supabase_1.supabase
                                .from('xp_logs')
                                .select('xp')
                                .eq('user_id', userId)
                                .gte('created_at', startISO),
                        ])];
                case 2:
                    _b = _5.sent(), foodResult = _b[0], waterResult = _b[1], sleepResult = _b[2], activityResult = _b[3], progressResult = _b[4], xpResult = _b[5];
                    todayCalories = (_d = (_c = foodResult.data) === null || _c === void 0 ? void 0 : _c.reduce(function (s, r) { return s + (Number(r.calories) || 0); }, 0)) !== null && _d !== void 0 ? _d : 0;
                    todayProtein = (_f = (_e = foodResult.data) === null || _e === void 0 ? void 0 : _e.reduce(function (s, r) { return s + (Number(r.protein) || 0); }, 0)) !== null && _f !== void 0 ? _f : 0;
                    todayCarbs = (_h = (_g = foodResult.data) === null || _g === void 0 ? void 0 : _g.reduce(function (s, r) { return s + (Number(r.carbs) || 0); }, 0)) !== null && _h !== void 0 ? _h : 0;
                    todayFats = (_k = (_j = foodResult.data) === null || _j === void 0 ? void 0 : _j.reduce(function (s, r) { return s + (Number(r.fats) || 0); }, 0)) !== null && _k !== void 0 ? _k : 0;
                    todayFiber = (_m = (_l = foodResult.data) === null || _l === void 0 ? void 0 : _l.reduce(function (s, r) { return s + (Number(r.fiber) || 0); }, 0)) !== null && _m !== void 0 ? _m : 0;
                    todayWater = (_p = (_o = waterResult.data) === null || _o === void 0 ? void 0 : _o.reduce(function (s, r) { return s + (Number(r.amount) || 0); }, 0)) !== null && _p !== void 0 ? _p : 0;
                    todaySleep = (_s = (_r = (_q = sleepResult.data) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.hours) !== null && _s !== void 0 ? _s : 0;
                    todayWorkout = ((_u = (_t = activityResult.data) === null || _t === void 0 ? void 0 : _t.length) !== null && _u !== void 0 ? _u : 0) > 0;
                    todayCaloriesBurned = (_w = (_v = activityResult.data) === null || _v === void 0 ? void 0 : _v.reduce(function (s, r) { return s + (Number(r.calories_burned) || 0); }, 0)) !== null && _w !== void 0 ? _w : 0;
                    streak = (_y = (_x = progressResult.data) === null || _x === void 0 ? void 0 : _x.streak) !== null && _y !== void 0 ? _y : 0;
                    totalXp = (_0 = (_z = progressResult.data) === null || _z === void 0 ? void 0 : _z.xp) !== null && _0 !== void 0 ? _0 : 0;
                    xp = (_2 = (_1 = xpResult.data) === null || _1 === void 0 ? void 0 : _1.reduce(function (s, r) { return s + (Number(r.xp) || 0); }, 0)) !== null && _2 !== void 0 ? _2 : 0;
                    dailyScore = (0, calculateDailyScore_1.calculateDailyScore)({
                        calories: todayCalories,
                        water: todayWater,
                        workout: todayWorkout,
                        sleep: todaySleep,
                    });
                    levelInfo = (0, levels_1.getLevelFromXP)(totalXp);
                    newHealthData = {
                        todayCalories: Math.round(todayCalories),
                        todayProtein: Math.round(todayProtein),
                        todayCarbs: Math.round(todayCarbs),
                        todayFats: Math.round(todayFats),
                        todayFiber: Math.round(todayFiber),
                        todayWater: Math.round(todayWater),
                        todayWorkout: todayWorkout,
                        todaySleep: Number(todaySleep),
                        todayCaloriesBurned: Math.round(todayCaloriesBurned),
                        dailyScore: dailyScore,
                        xp: Math.round(xp),
                        totalXp: Math.round(totalXp),
                        level: levelInfo.level,
                        streak: streak,
                        timeline: [],
                        lastCelebratedLevel: (_4 = (_3 = progressResult.data) === null || _3 === void 0 ? void 0 : _3.last_celebrated_level) !== null && _4 !== void 0 ? _4 : 0,
                    };
                    setHealthData(newHealthData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _5.sent();
                    console.error(err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setInitialized(true);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load on mount
    (0, react_1.useEffect)(function () {
        loadTodayData();
    }, [loadTodayData]);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        var currentXP = (_a = healthData === null || healthData === void 0 ? void 0 : healthData.totalXp) !== null && _a !== void 0 ? _a : 0;
        // first render
        if (previousXPRef.current === null) {
            previousXPRef.current = currentXP;
            return;
        }
        // ignore no change or decrease
        if (currentXP <= previousXPRef.current) {
            previousXPRef.current = currentXP;
            return;
        }
        var previousLevel = (0, levels_1.getLevelFromXP)(previousXPRef.current).level;
        var newLevel = (0, levels_1.getLevelFromXP)(currentXP).level;
        previousXPRef.current = currentXP;
        if (newLevel > previousLevel &&
            newLevel > ((_b = healthData === null || healthData === void 0 ? void 0 : healthData.lastCelebratedLevel) !== null && _b !== void 0 ? _b : 0)) {
            var levelInfo = (0, levels_1.getLevelFromXP)(currentXP);
            setPendingLevelUp({
                level: levelInfo.level,
                title: levelInfo.title,
            });
        }
    }, [healthData === null || healthData === void 0 ? void 0 : healthData.totalXp]);
    // ==========================================
    // UPDATE HEALTH DATA
    // ==========================================
    var updateHealthData = function (updates) {
        setHealthData(function (prev) { return (__assign(__assign({}, prev), updates)); });
    };
    var clearPendingLevelUp = function () {
        setPendingLevelUp(null);
    };
    // ==========================================
    // ADD PARSED CHECK-IN
    // ==========================================
    var addParsedCheckIn = function (parsed) { return __awaiter(_this, void 0, void 0, function () {
        var _a, user, error, user_id, tasks, xpAwarded, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                case 1:
                    _a = _b.sent(), user = _a.data.user, error = _a.error;
                    if (error || !(user === null || user === void 0 ? void 0 : user.id))
                        throw new Error('User not authenticated');
                    user_id = user.id;
                    tasks = [];
                    xpAwarded = 0;
                    if (parsed.calories > 0) {
                        tasks.push((0, food_1.addFood)({
                            user_id: user_id,
                            meal_name: parsed.meal_name || 'Meal',
                            calories: parsed.calories || 0,
                            protein: parsed.protein || 0,
                            carbs: parsed.carbs || 0,
                            fats: parsed.fats || 0,
                            fiber: parsed.fiber || 0,
                            meal_type: parsed.meal_type || 'snack',
                            created_at: new Date().toISOString(),
                        }));
                        xpAwarded += XP_PER_CHECKIN.food;
                    }
                    if (parsed.water > 0) {
                        tasks.push((0, hydration_1.addWater)(parsed.water * 1000, new Date().toISOString(), user_id));
                        xpAwarded += XP_PER_CHECKIN.water;
                    }
                    if (parsed.workout) {
                        tasks.push((0, activity_1.addActivity)({
                            user_id: user_id,
                            activity_name: parsed.activity_name || 'Workout',
                            duration: parsed.duration || 30,
                            calories_burned: parsed.calories_burned || 0,
                        }));
                        xpAwarded += XP_PER_CHECKIN.activity;
                    }
                    if (parsed.sleep > 0) {
                        tasks.push((0, sleep_1.addSleep)({
                            user_id: user_id,
                            hours: parsed.sleep || 0,
                            quality: parsed.quality || 'good',
                            date: new Date().toISOString(),
                        }));
                        xpAwarded += XP_PER_CHECKIN.sleep;
                    }
                    if (!(tasks.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.all(tasks)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, streaks_1.updateDailyStreak)(user_id)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    if (!(xpAwarded > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, xp_1.awardCheckInXp)(xpAwarded, 'Daily Check-In', user_id)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: 
                // Reload fresh data from Supabase after saving
                return [4 /*yield*/, loadTodayData()];
                case 7:
                    // Reload fresh data from Supabase after saving
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    err_2 = _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // ==========================================
    // RESET DAILY DATA
    // ==========================================
    var resetDailyData = function () {
        setHealthData(function (prev) { return (__assign(__assign({}, prev), { todayCalories: 0, todayProtein: 0, todayCarbs: 0, todayFats: 0, todayFiber: 0, todayWater: 0, todayWorkout: false, todaySleep: 0, todayCaloriesBurned: 0, dailyScore: 0, xp: 0, timeline: [] })); });
    };
    return (react_1.default.createElement(HealthContext.Provider, { value: {
            healthData: healthData,
            initialized: initialized,
            pendingLevelUp: pendingLevelUp,
            clearPendingLevelUp: clearPendingLevelUp,
            updateHealthData: updateHealthData,
            addParsedCheckIn: addParsedCheckIn,
            resetDailyData: resetDailyData,
            refreshHealthData: loadTodayData,
        } }, children));
}
function useHealth() {
    return (0, react_1.useContext)(HealthContext);
}
