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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDailyMission = useDailyMission;
var react_1 = require("react");
var AuthContext_1 = require("../context/AuthContext");
var HealthContext_1 = require("../context/HealthContext");
var supabase_1 = require("../services/supabase");
var xp_1 = require("../services/xp");
var streaks_1 = require("../services/streaks");
var missionTemplates_1 = require("../constants/missionTemplates");
function useDailyMission() {
    var _this = this;
    var user = (0, AuthContext_1.useAuth)().user;
    var refreshHealthData = (0, HealthContext_1.useHealth)().refreshHealthData;
    var _a = (0, react_1.useState)(null), mission = _a[0], setMission = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var today = new Date().toISOString().split('T')[0];
    (0, react_1.useEffect)(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        fetchOrGenerate();
    }, [user === null || user === void 0 ? void 0 : user.id]);
    function fetchOrGenerate() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, existing, error, _b, data, fnError, err_1, fallback;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        setLoading(true);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, supabase_1.supabase
                                .from('daily_missions')
                                .select('*')
                                .eq('user_id', user.id)
                                .eq('date', today)
                                .single()];
                    case 2:
                        _a = _c.sent(), existing = _a.data, error = _a.error;
                        if (existing && !error) {
                            setMission(existing);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, supabase_1.supabase.functions.invoke('generate-mission', { body: { user_id: user.id, date: today } })];
                    case 3:
                        _b = _c.sent(), data = _b.data, fnError = _b.error;
                        if (fnError)
                            throw fnError;
                        setMission(data);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _c.sent();
                        console.error('[useDailyMission] fetch/generate failed:', err_1);
                        fallback = (0, missionTemplates_1.getFallbackTemplate)(today);
                        setMission({
                            id: 'fallback',
                            date: today,
                            missions: fallback.missions,
                            coach_message: fallback.coach_message,
                            completed_missions: [],
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    var completeMission = (0, react_1.useCallback)(function (index) { return __awaiter(_this, void 0, void 0, function () {
        var latestMission, updatedCompleted, allCompleted, earnedXp, err_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!mission || !(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('daily_missions')
                            .select('completed_missions')
                            .eq('id', mission.id)
                            .single()];
                case 1:
                    latestMission = (_d.sent()).data;
                    if ((_a = latestMission === null || latestMission === void 0 ? void 0 : latestMission.completed_missions) === null || _a === void 0 ? void 0 : _a.includes(index)) {
                        console.log('Mission already completed. Skipping XP.');
                        return [2 /*return*/];
                    }
                    // Guard: idempotent — ignore if already completed
                    if (mission.completed_missions.includes(index))
                        return [2 /*return*/];
                    updatedCompleted = __spreadArray(__spreadArray([], mission.completed_missions, true), [index], false);
                    allCompleted = updatedCompleted.length ===
                        mission.missions.length;
                    earnedXp = (_c = (_b = mission.missions[index]) === null || _b === void 0 ? void 0 : _b.xp) !== null && _c !== void 0 ? _c : 50;
                    // Optimistic update — UI responds immediately
                    setMission(function (prev) {
                        return prev ? __assign(__assign({}, prev), { completed_missions: updatedCompleted }) : prev;
                    });
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, Promise.all([
                            mission.id !== 'fallback'
                                ? supabase_1.supabase
                                    .from('daily_missions')
                                    .update({
                                    completed_missions: updatedCompleted,
                                })
                                    .eq('id', mission.id)
                                : Promise.resolve(),
                            (0, xp_1.awardCheckInXp)(earnedXp, 'Mission Complete', user.id),
                        ])];
                case 3:
                    _d.sent();
                    if (!allCompleted) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, streaks_1.updateDailyStreak)(user.id)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5: return [4 /*yield*/, refreshHealthData()];
                case 6:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _d.sent();
                    console.error('[useDailyMission] completeMission failed:', err_2);
                    // Rollback optimistic update on failure
                    setMission(function (prev) {
                        return prev
                            ? __assign(__assign({}, prev), { completed_missions: prev.completed_missions.filter(function (i) { return i !== index; }) }) : prev;
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [mission, user === null || user === void 0 ? void 0 : user.id, refreshHealthData]);
    return { mission: mission, loading: loading, completeMission: completeMission };
}
