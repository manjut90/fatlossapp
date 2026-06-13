"use strict";
// HomeScreen.tsx
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
exports.default = HomeScreen;
var MissionCard_1 = require("../components/MissionCard");
var HealthContext_1 = require("../context/HealthContext");
var weather_1 = require("../services/weather");
var levels_1 = require("../constants/levels");
var react_1 = require("react");
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var expo_linear_gradient_1 = require("expo-linear-gradient");
var react_native_svg_1 = require("react-native-svg");
var lucide_react_native_1 = require("lucide-react-native");
var AuthContext_1 = require("../context/AuthContext");
var LevelUpModal_1 = require("../components/LevelUpModal");
var progress_1 = require("../services/progress");
var AchievementUnlockedModal_1 = require("../components/AchievementUnlockedModal");
var useGamificationStore_1 = require("./gamification/store/useGamificationStore");
// ── PROGRESS RING component ──
function ProgressRing(_a) {
    var progress = _a.progress, color = _a.color, _b = _a.size, size = _b === void 0 ? 68 : _b, _c = _a.strokeWidth, strokeWidth = _c === void 0 ? 4 : _c, children = _a.children, completed = _a.completed;
    var radius = (size - strokeWidth) / 2;
    var circumference = 2 * Math.PI * radius;
    var strokeDashoffset = circumference - (progress / 100) * circumference;
    return (react_1.default.createElement(react_native_1.View, { style: { width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
        react_1.default.createElement(react_native_svg_1.default, { width: size, height: size, style: { position: 'absolute' } },
            react_1.default.createElement(react_native_svg_1.Circle, { cx: size / 2, cy: size / 2, r: radius, stroke: "#ECECEC", strokeWidth: strokeWidth, fill: "none" }),
            react_1.default.createElement(react_native_svg_1.Circle, { cx: size / 2, cy: size / 2, r: radius, stroke: completed ? color : color + '99', strokeWidth: strokeWidth, fill: "none", strokeDasharray: "".concat(circumference, " ").concat(circumference), strokeDashoffset: strokeDashoffset, strokeLinecap: "round", transform: "rotate(-90 ".concat(size / 2, " ").concat(size / 2, ")") })),
        children));
}
function HomeScreen() {
    var _this = this;
    var _a, _b, _c;
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var navigation = (0, native_1.useNavigation)();
    var _d = (0, react_1.useState)(''), firstName = _d[0], setFirstName = _d[1];
    var _e = (0, react_1.useState)('Hey'), greeting = _e[0], setGreeting = _e[1];
    var _f = (0, useGamificationStore_1.useGamificationStore)(), pendingAchievement = _f.pendingAchievement, clearPendingAchievement = _f.clearPendingAchievement;
    var profile = (0, AuthContext_1.useAuth)().profile;
    var _g = (0, HealthContext_1.useHealth)(), healthData = _g.healthData, refreshHealthData = _g.refreshHealthData, pendingLevelUp = _g.pendingLevelUp, clearPendingLevelUp = _g.clearPendingLevelUp;
    (0, react_1.useEffect)(function () {
        var hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning,');
        }
        else if (hour < 18) {
            setGreeting('Good afternoon,');
        }
        else {
            setGreeting('Good evening,');
        }
    }, []);
    (0, react_1.useEffect)(function () {
        var rawName = (profile === null || profile === void 0 ? void 0 : profile.full_name) || (profile === null || profile === void 0 ? void 0 : profile.username) || '';
        if (rawName) {
            var name_1 = rawName.split(' ')[0];
            setFirstName(name_1.charAt(0).toUpperCase() + name_1.slice(1));
        }
    }, [profile === null || profile === void 0 ? void 0 : profile.full_name, profile === null || profile === void 0 ? void 0 : profile.username]);
    var _h = (0, react_1.useState)(null), temperature = _h[0], setTemperature = _h[1];
    var _j = (0, react_1.useState)(''), aiSummary = _j[0], setAiSummary = _j[1];
    var _k = (0, react_1.useState)(false), summaryLoading = _k[0], setSummaryLoading = _k[1];
    (0, react_1.useEffect)(function () {
        var fetchAiSummary = function () { return __awaiter(_this, void 0, void 0, function () {
            var claudeKey, prompt_1, res, err, data, summary, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        setSummaryLoading(true);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
                        if (!claudeKey) {
                            setAiSummary(getPrimeStateSummary()); // Fallback to local summary
                            return [2 /*return*/];
                        }
                        prompt_1 = "You are a world-class fitness coach and nutritionist. The user's stats today: calories=".concat(healthData.todayCalories, ", protein=").concat(healthData.todayProtein, "g, water=").concat(healthData.todayWater, "ml, sleep=").concat(healthData.todaySleep, "h, workout=").concat(healthData.todayWorkout, ", goal=").concat(userGoal, ", current weight=").concat(currentWeight, "kg, target weight=").concat(targetWeight, "kg. Give ONE powerful, specific, data-driven coaching insight in max 20 words. Sound like the top 1% fitness coach. Be direct, specific to their numbers, no fluff.");
                        return [4 /*yield*/, fetch('https://api.anthropic.com/v1/messages', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-api-key': claudeKey || '',
                                    'anthropic-version': '2023-06-01',
                                    'anthropic-dangerous-direct-browser-access': 'true',
                                },
                                body: JSON.stringify({
                                    model: 'claude-haiku-4-5-20251001',
                                    max_tokens: 1000,
                                    messages: [{ role: 'user', content: prompt_1 }],
                                }),
                            })];
                    case 2:
                        res = _d.sent();
                        if (!!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.json()];
                    case 3:
                        err = _d.sent();
                        throw new Error("Claude API failed: ".concat(res.status));
                    case 4: return [4 /*yield*/, res.json()];
                    case 5:
                        data = _d.sent();
                        summary = ((_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.trim()) || getPrimeStateSummary();
                        setAiSummary(summary);
                        return [3 /*break*/, 8];
                    case 6:
                        error_1 = _d.sent();
                        setAiSummary(getPrimeStateSummary()); // Fallback on error
                        return [3 /*break*/, 8];
                    case 7:
                        setSummaryLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        if (healthData.todayCalories > 0 || healthData.todayWorkout) {
            fetchAiSummary();
        }
        else {
            setAiSummary(getPrimeStateSummary());
        }
    }, [healthData]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        refreshHealthData();
    }, [refreshHealthData]));
    var handleViewAllPress = function () { return navigation.navigate('CheckIn'); };
    var handleSharePress = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, react_native_1.Share.share({
                            message: "I'm at ".concat(dailyScore, "% daily score on my transformation journey \uD83D\uDD25"),
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleImprovePress = function () { return navigation.navigate('CheckIn'); };
    var dailyScore = (healthData === null || healthData === void 0 ? void 0 : healthData.dailyScore) || 0;
    var caloriesGoal = (profile === null || profile === void 0 ? void 0 : profile.target_calories) || 2000;
    var proteinGoal = (profile === null || profile === void 0 ? void 0 : profile.target_protein) || 150;
    var waterGoal = 2500;
    var sleepGoal = 8;
    var currentWeight = (profile === null || profile === void 0 ? void 0 : profile.current_weight) || 0;
    var targetWeight = (profile === null || profile === void 0 ? void 0 : profile.target_weight) || 0;
    var userGoal = ((_a = profile === null || profile === void 0 ? void 0 : profile.goals) === null || _a === void 0 ? void 0 : _a[0]) || 'fat_loss';
    var gender = ((profile === null || profile === void 0 ? void 0 : profile.gender) || '').toLowerCase().trim();
    var fiberGoal = gender === 'male' || gender === 'man' ? 38 : 25;
    var carbsGoal = 250;
    var fatsGoal = 80;
    var fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var livePulse = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var checkInGlow = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start();
        react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(livePulse, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(livePulse, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])).start();
        react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(checkInGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
            react_native_1.Animated.timing(checkInGlow, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])).start();
        (0, weather_1.getWeatherTemp)().then(setTemperature);
    }, []);
    var liveOpacity = livePulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
    // ── CHECK-IN items with ring progress ──
    var checkInItems = [
        {
            type: 'food',
            label: 'Food',
            icon: react_1.default.createElement(lucide_react_native_1.Utensils, { size: 18, color: "#FF8C42" }),
            ringColor: '#FF8C42',
            dotColor: '#FF8C42',
            bubbleColor: '#FFF0DD',
            completed: healthData.todayCalories > 0,
            progress: Math.min(100, (healthData.todayCalories / caloriesGoal) * 100),
        },
        {
            type: 'water',
            label: 'Water',
            icon: react_1.default.createElement(lucide_react_native_1.Droplets, { size: 18, color: "#4AA9FF" }),
            ringColor: '#4AA9FF',
            dotColor: '#4AA9FF',
            bubbleColor: '#E8F5FF',
            completed: healthData.todayWater >= waterGoal * 0.8,
            progress: Math.min(100, (healthData.todayWater / waterGoal) * 100),
        },
        {
            type: 'workout',
            label: 'Workout',
            icon: react_1.default.createElement(lucide_react_native_1.Dumbbell, { size: 18, color: "#8B7CFF" }),
            ringColor: '#8B7CFF',
            dotColor: '#8B7CFF',
            bubbleColor: '#EAE6FF',
            completed: !!healthData.todayWorkout,
            progress: healthData.todayWorkout ? 100 : 0,
        },
        {
            type: 'sleep',
            label: 'Sleep',
            icon: react_1.default.createElement(lucide_react_native_1.MoonStar, { size: 18, color: "#FFAD42" }),
            ringColor: '#FFAD42',
            dotColor: '#FFAD42',
            bubbleColor: '#FFF8EC',
            completed: healthData.todaySleep >= 7,
            progress: Math.min(100, (healthData.todaySleep / sleepGoal) * 100),
        },
    ];
    // ── PRIME STATE — personal health summary ──
    var getPrimeStateTitle = function () {
        var wins = [];
        if (healthData.todayWorkout)
            wins.push(1);
        if (healthData.todayWater / waterGoal >= 0.8)
            wins.push(1);
        if (healthData.todaySleep >= 7)
            wins.push(1);
        if (healthData.todayCalories > 0)
            wins.push(1);
        if (wins.length >= 4)
            return 'Peak Momentum';
        if (wins.length >= 2)
            return 'Building Rhythm';
        if (wins.length > 0)
            return 'On Track';
        return 'Starting Strong';
    };
    var getPrimeStateSummary = function () {
        var todayProtein = healthData.todayProtein, todayWater = healthData.todayWater, todayWorkout = healthData.todayWorkout;
        var proteinGoal = (profile === null || profile === void 0 ? void 0 : profile.target_protein) || 150;
        if (todayProtein > 0 && todayProtein < proteinGoal * 0.5) {
            return "Protein critically low. Add 2 eggs or 100g chicken to your next meal.";
        }
        if (todayWater < 1000) {
            return "Under 1L water logged. Dehydration kills fat loss by 23%. Drink now.";
        }
        if (!todayWorkout) {
            return "No workout logged yet. Even 20 mins raises metabolism for 14 hours.";
        }
        return "Log your meals and workout to unlock your personalised coaching insight.";
    };
    // XP progress toward next level (1000 XP per level)
    var levelInfo = (0, levels_1.getLevelFromXP)(healthData.totalXp || 0);
    var xpInCurrentLevel = (healthData.totalXp || 0) - levelInfo.currentLevelXp;
    var xpNeededForLevel = levelInfo.nextLevelXp !== null
        ? levelInfo.nextLevelXp - levelInfo.currentLevelXp
        : 0;
    var xpRemaining = levelInfo.nextLevelXp !== null
        ? levelInfo.nextLevelXp - (healthData.totalXp || 0)
        : 0;
    var xpProgress = levelInfo.progressPercent;
    // ── OPTIMIZE TODAY — only shows when off track ──
    var getOptimizeItems = function () {
        var items = [];
        var caloriesRemaining = caloriesGoal - healthData.todayCalories;
        var proteinRemaining = proteinGoal - healthData.todayProtein;
        var waterRemaining = waterGoal - healthData.todayWater;
        if (caloriesRemaining > caloriesGoal * 0.4) {
            items.push('Log your next meal to fuel your progress');
        }
        if (proteinRemaining > 30) {
            items.push('Add a protein source like eggs or chicken to your next meal');
        }
        if (waterRemaining > waterGoal * 0.5) {
            items.push('A glass of water right now is a great idea');
        }
        if (!healthData.todayWorkout) {
            items.push('Even a 20-min walk is a win for today');
        }
        return items;
    };
    var optimizeItems = getOptimizeItems();
    var isOffTrack = optimizeItems.length > 0;
    // ── MACROS STATUS labels ──
    var getMacroStatus = function (value, target) {
        var pct = value / target;
        if (pct < 0.3)
            return 'Low';
        if (pct > 1.1)
            return 'Over';
        if (pct >= 1)
            return 'Hit ✓';
        return 'On track';
    };
    return (react_1.default.createElement(react_native_1.View, { style: styles.container },
        react_1.default.createElement(AchievementUnlockedModal_1.AchievementUnlockedModal, { visible: !!pendingAchievement, name: (pendingAchievement === null || pendingAchievement === void 0 ? void 0 : pendingAchievement.name) || '', description: (pendingAchievement === null || pendingAchievement === void 0 ? void 0 : pendingAchievement.description) || '', onClose: clearPendingAchievement }),
        react_1.default.createElement(expo_linear_gradient_1.LinearGradient, { colors: ['#0B1020', '#0B1020', '#0B1020'], style: react_native_1.StyleSheet.absoluteFillObject }),
        react_1.default.createElement(react_native_1.ScrollView, { showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: 90 } },
            react_1.default.createElement(react_native_1.Animated.View, { style: { opacity: fadeAnim } },
                react_1.default.createElement(react_native_1.View, { style: [styles.header, { paddingTop: insets.top + 20 }] },
                    react_1.default.createElement(react_native_1.View, { style: styles.headerContent },
                        react_1.default.createElement(react_native_1.View, { style: styles.headerLeft },
                            react_1.default.createElement(react_native_1.View, { style: styles.avatar },
                                react_1.default.createElement(react_native_1.Image, { source: require('../assets/neo_logo.png'), style: { width: 52, height: 52, resizeMode: 'contain' } })),
                            react_1.default.createElement(react_native_1.View, null,
                                react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', alignItems: 'baseline' } },
                                    react_1.default.createElement(react_native_1.Text, { style: styles.greeting },
                                        greeting,
                                        " "),
                                    react_1.default.createElement(react_native_1.Text, { style: styles.friendText }, firstName || 'there')),
                                react_1.default.createElement(react_native_1.Text, { style: styles.subtitle },
                                    react_1.default.createElement(react_native_1.Text, { style: { color: '#F7C873', fontWeight: '900', fontSize: 13, letterSpacing: 2 } }, "EARN. "),
                                    react_1.default.createElement(react_native_1.Text, { style: { color: '#8B7CFF', fontWeight: '900', fontSize: 13, letterSpacing: 2 } }, "RISE. "),
                                    react_1.default.createElement(react_native_1.Text, { style: { color: '#FF8FA3', fontWeight: '900', fontSize: 13, letterSpacing: 2 } }, "ASCEND.")))),
                        react_1.default.createElement(react_native_1.View, { style: { width: 28 } }))),
                react_1.default.createElement(MissionCard_1.MissionCard, null),
                react_1.default.createElement(react_native_1.View, { style: styles.checkinCard },
                    react_1.default.createElement(react_native_1.View, { style: styles.checkinHeader },
                        react_1.default.createElement(react_native_1.View, { style: styles.checkinTitleWrap },
                            react_1.default.createElement(react_native_1.View, { style: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginRight: 6 } },
                                react_1.default.createElement(react_native_1.Animated.View, { style: {
                                        position: 'absolute',
                                        width: 14,
                                        height: 14,
                                        borderRadius: 7,
                                        backgroundColor: '#8B7CFF',
                                        opacity: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
                                        transform: [{ scale: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                                    } }),
                                react_1.default.createElement(react_native_1.View, { style: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8B7CFF' } })),
                            react_1.default.createElement(react_native_1.Text, { style: styles.checkinTitle }, "TODAY'S CHECK-INS"))),
                    react_1.default.createElement(react_native_1.View, { style: styles.timelineWrap }, checkInItems.map(function (item, index) { return (react_1.default.createElement(react_1.default.Fragment, { key: item.type },
                        react_1.default.createElement(react_native_1.View, { style: styles.timelineItem },
                            react_1.default.createElement(ProgressRing, { progress: item.progress, color: item.ringColor, size: 50, strokeWidth: 4, completed: item.completed },
                                react_1.default.createElement(react_native_1.View, { style: [styles.timelineBubble, { backgroundColor: item.bubbleColor }] }, item.icon)),
                            react_1.default.createElement(react_native_1.Text, { style: styles.timelineLabel }, item.label),
                            item.completed ? (react_1.default.createElement(react_native_1.View, { style: [styles.completedDot, {
                                        backgroundColor: item.dotColor,
                                        shadowColor: item.dotColor,
                                    }] })) : (react_1.default.createElement(react_native_1.View, { style: styles.pendingDot }))),
                        index < checkInItems.length - 1 && (react_1.default.createElement(react_native_1.View, { style: styles.timelineConnector })))); }))),
                react_1.default.createElement(react_native_1.View, { style: styles.primeCard },
                    react_1.default.createElement(react_native_1.TouchableOpacity, { activeOpacity: 0.85, onPress: handleSharePress, style: styles.shareFloating },
                        react_1.default.createElement(lucide_react_native_1.Share2, { size: 14, color: "#7C7C7C", strokeWidth: 2.2 })),
                    react_1.default.createElement(react_native_1.View, { style: styles.primeLeft },
                        react_1.default.createElement(react_native_1.View, { style: styles.primeTopRow },
                            react_1.default.createElement(react_native_1.View, { style: styles.primeTag },
                                react_1.default.createElement(lucide_react_native_1.Sparkles, { size: 12, color: "#8B7CFF" }),
                                react_1.default.createElement(react_native_1.Text, { style: styles.primeTagText }, "YOUR SUMMARY")),
                            react_1.default.createElement(react_native_1.View, { style: styles.weatherPill },
                                react_1.default.createElement(lucide_react_native_1.CloudRain, { size: 11, color: "#88A1A8" }),
                                react_1.default.createElement(react_native_1.Text, { style: styles.weatherText }, temperature !== null && temperature !== void 0 ? temperature : '--',
                                    "\u00B0"))),
                        react_1.default.createElement(react_native_1.Text, { style: styles.primeTitle }, getPrimeStateTitle()),
                        react_1.default.createElement(react_native_1.Text, { style: styles.primeSub }, summaryLoading ? 'Neo is reviewing your data...' : aiSummary || getPrimeStateSummary()),
                        react_1.default.createElement(react_native_1.View, { style: styles.levelSection },
                            react_1.default.createElement(react_native_1.Text, { style: styles.levelText },
                                "LEVEL ",
                                healthData.level || 1),
                            react_1.default.createElement(react_native_1.Text, { style: styles.xpText },
                                xpInCurrentLevel,
                                " / ",
                                xpNeededForLevel,
                                " XP"),
                            react_1.default.createElement(react_native_1.View, { style: styles.levelTrack },
                                react_1.default.createElement(expo_linear_gradient_1.LinearGradient, { colors: ['#8B7CFF', '#FF8FA3'], style: [styles.levelFill, { width: "".concat(xpProgress, "%") }] })),
                            react_1.default.createElement(react_native_1.Text, { style: styles.xpText },
                                xpRemaining,
                                " XP to Level ",
                                (healthData.level || 1) + 1))),
                    react_1.default.createElement(react_native_1.View, { style: styles.verticalDivider }),
                    react_1.default.createElement(react_native_1.View, { style: styles.primeRight },
                        react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.navigate('CheckIn', { screen: 'Food' }); } },
                            react_1.default.createElement(Metric, { icon: react_1.default.createElement(lucide_react_native_1.Flame, { size: 14, color: "#F3A24B" }), title: "CALORIES IN", value: "".concat(healthData.todayCalories), sub: "".concat(healthData.todayCalories, " / ").concat(caloriesGoal), color: "#F3A24B", progress: Math.min(100, (healthData.todayCalories / caloriesGoal) * 100), textColor: '#F7F8FC', subColor: '#6B7280' })),
                        react_1.default.createElement(react_native_1.View, { style: styles.metricDivider }),
                        react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.navigate('CheckIn', { screen: 'Activity' }); } },
                            react_1.default.createElement(Metric, { icon: react_1.default.createElement(lucide_react_native_1.TrendingUp, { size: 14, color: "#FF5F85" }), title: "CAL BURNED", value: "".concat(healthData.todayCaloriesBurned || 0), sub: healthData.todayWorkout ? 'From workout' : 'No workout yet', color: "#FF5F85", progress: Math.min(100, ((healthData.todayCaloriesBurned || 0) / 500) * 100), textColor: '#F7F8FC', subColor: '#6B7280' })))),
                react_1.default.createElement(react_native_1.View, { style: styles.healthOverview },
                    react_1.default.createElement(HealthMini, { icon: react_1.default.createElement(lucide_react_native_1.Droplets, { size: 17, color: "#4B9EFF" }), title: "HYDRATE", value: "".concat(((healthData.todayWater || 0) / 1000).toFixed(1), "L"), sub: "".concat(Math.min(100, Math.round(((healthData.todayWater || 0) / waterGoal) * 100)), "%"), color: "#4B9EFF" }),
                    react_1.default.createElement(HealthMini, { icon: react_1.default.createElement(lucide_react_native_1.MoonStar, { size: 17, color: "#8B6BFF" }), title: "RECOVER", value: "".concat(dailyScore, "%"), sub: "Score", color: "#8B6BFF" }),
                    react_1.default.createElement(HealthMini, { icon: react_1.default.createElement(lucide_react_native_1.Footprints, { size: 17, color: "#59A95D" }), title: "MOVE", value: healthData.todayWorkout ? 'Done' : '--', sub: healthData.todayWorkout ? 'Tracked' : 'Pending', color: "#59A95D" }),
                    react_1.default.createElement(HealthMini, { icon: react_1.default.createElement(lucide_react_native_1.Bed, { size: 17, color: "#5A9CFF" }), title: "SLEEP", value: "".concat(healthData.todaySleep || 0, "h"), sub: healthData.todaySleep >= 7 ? 'Good' : healthData.todaySleep > 0 ? 'Low' : '--', color: "#5A9CFF" }),
                    react_1.default.createElement(HealthMini, { icon: react_1.default.createElement(lucide_react_native_1.Flame, { size: 17, color: "#FF922E" }), title: "STREAK", value: "".concat(healthData.streak || 0), sub: "days", color: "#FF922E" })),
                isOffTrack && (react_1.default.createElement(react_native_1.View, { style: styles.optimizeCard },
                    react_1.default.createElement(react_native_1.View, { style: styles.optimizeLeft },
                        react_1.default.createElement(react_native_1.View, { style: styles.optimizeTop },
                            react_1.default.createElement(lucide_react_native_1.AlertTriangle, { size: 13, color: "#F59E0B" }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.optimizeLabel }, "OPTIMIZE TODAY")),
                        optimizeItems.slice(0, 2).map(function (item, i) { return (react_1.default.createElement(react_native_1.View, { key: i, style: styles.optimizeItem },
                            react_1.default.createElement(react_native_1.View, { style: styles.optimizeDot }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.optimizeText }, item))); })),
                    react_1.default.createElement(react_native_1.TouchableOpacity, { activeOpacity: 0.85, onPress: handleImprovePress, style: styles.optimizeButton },
                        react_1.default.createElement(react_native_1.Text, { style: styles.optimizeButtonText }, "Fix it")))),
                react_1.default.createElement(react_native_1.View, { style: styles.fuelCard },
                    react_1.default.createElement(react_native_1.View, { style: styles.fuelHeader },
                        react_1.default.createElement(react_native_1.View, { style: styles.fuelTitleWrap },
                            react_1.default.createElement(lucide_react_native_1.Leaf, { size: 14, color: "#5EA765", strokeWidth: 2.2 }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.fuelTitle }, "MACROS BREAKDOWN"))),
                    [
                        { label: 'PROTEIN', value: healthData.todayProtein || 0, target: proteinGoal, unit: 'g', color: '#8B7CFF' },
                        { label: 'CARBS', value: healthData.todayCarbs || 0, target: carbsGoal, unit: 'g', color: '#4A90FF' },
                        { label: 'FATS', value: healthData.todayFats || 0, target: fatsGoal, unit: 'g', color: '#FF8C42' },
                        { label: 'FIBER', value: healthData.todayFiber || 0, target: fiberGoal, unit: 'g', color: '#5EA765' },
                    ].map(function (macro) { return (react_1.default.createElement(react_native_1.View, { key: macro.label, style: styles.macroRow },
                        react_1.default.createElement(react_native_1.Text, { style: [styles.macroLabel, { color: macro.color }] }, macro.label),
                        react_1.default.createElement(react_native_1.View, { style: styles.macroBarWrap },
                            react_1.default.createElement(react_native_1.View, { style: styles.macroBar },
                                react_1.default.createElement(react_native_1.View, { style: [
                                        styles.macroFill,
                                        {
                                            width: "".concat(Math.min(100, (macro.value / macro.target) * 100), "%"),
                                            backgroundColor: macro.color,
                                        },
                                    ] }))),
                        react_1.default.createElement(react_native_1.Text, { style: styles.macroValue },
                            Math.round(macro.value),
                            macro.unit,
                            react_1.default.createElement(react_native_1.Text, { style: styles.macroTarget },
                                "/",
                                macro.target,
                                macro.unit)),
                        react_1.default.createElement(react_native_1.Text, { style: [styles.macroStatus, { color: macro.color }] }, getMacroStatus(macro.value, macro.target)))); })))),
        react_1.default.createElement(LevelUpModal_1.LevelUpModal, { visible: !!pendingLevelUp, level: (_b = pendingLevelUp === null || pendingLevelUp === void 0 ? void 0 : pendingLevelUp.level) !== null && _b !== void 0 ? _b : 1, title: (_c = pendingLevelUp === null || pendingLevelUp === void 0 ? void 0 : pendingLevelUp.title) !== null && _c !== void 0 ? _c : '', onClose: function () { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, , 2, 3]);
                            return [4 /*yield*/, (0, progress_1.updateLastCelebratedLevel)((_a = pendingLevelUp === null || pendingLevelUp === void 0 ? void 0 : pendingLevelUp.level) !== null && _a !== void 0 ? _a : 0)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            clearPendingLevelUp();
                            return [7 /*endfinally*/];
                        case 3: return [2 /*return*/];
                    }
                });
            }); } })));
}
function Metric(_a) {
    var icon = _a.icon, title = _a.title, value = _a.value, sub = _a.sub, progress = _a.progress, color = _a.color, textColor = _a.textColor, subColor = _a.subColor;
    return (react_1.default.createElement(react_native_1.View, null,
        react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', alignItems: 'center' } },
            icon,
            react_1.default.createElement(react_native_1.Text, { style: { marginLeft: 7, color: '#666', fontSize: 9, fontWeight: '700' } }, title)),
        react_1.default.createElement(react_native_1.Text, { style: { fontSize: 22, fontWeight: '800', color: textColor || '#1E1E1E', marginTop: 8 } }, value),
        react_1.default.createElement(react_native_1.Text, { style: { color: subColor || '#777', marginTop: 2, fontSize: 10 } }, sub),
        react_1.default.createElement(react_native_1.View, { style: { height: 5, backgroundColor: '#1A2235', borderRadius: 999, overflow: 'hidden', marginTop: 10 } },
            react_1.default.createElement(react_native_1.View, { style: { width: "".concat(progress, "%"), height: 5, backgroundColor: color } }))));
}
function HealthMini(_a) {
    var icon = _a.icon, title = _a.title, value = _a.value, sub = _a.sub, color = _a.color;
    return (react_1.default.createElement(react_native_1.View, { style: styles.healthMiniCard },
        react_1.default.createElement(react_native_1.View, { style: [styles.iconGlowWrap, { shadowColor: color, shadowOpacity: 0.3, shadowRadius: 10 }] }, icon),
        react_1.default.createElement(react_native_1.Text, { style: [styles.healthMiniLabel, { color: color }] }, title),
        react_1.default.createElement(react_native_1.Text, { style: styles.healthMiniValue }, value),
        react_1.default.createElement(react_native_1.Text, { style: styles.healthMiniSub }, sub)));
}
var styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B1020' },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#0B1020',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'transparent',
        marginRight: 12,
        position: 'relative',
    },
    brainIconWrapper: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#1A2235',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0B1020',
    },
    greeting: {
        fontFamily: 'Epilogue-Bold',
        fontSize: 20,
        color: '#F7F8FC',
        fontWeight: '700',
    },
    friendText: {
        fontFamily: 'Epilogue-Bold',
        fontSize: 22,
        color: '#8B7CFF',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 6,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    betterYou: {
        color: '#8B7CFF',
        fontWeight: 'bold',
    },
    // CHECK-IN CARD
    checkinCard: {
        marginHorizontal: 18, marginTop: 18, backgroundColor: '#131929',
        borderRadius: 24, paddingTop: 16, paddingBottom: 18, paddingHorizontal: 16,
        borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)',
    },
    checkinHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
    },
    checkinTitleWrap: { flexDirection: 'row', alignItems: 'center' },
    checkinIconMini: {
        width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(139,124,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    liveDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: '#63BA63',
        position: 'absolute', bottom: 0, right: 0,
    },
    checkinClock: { fontSize: 10, color: '#8B7CFF', fontWeight: '700' },
    checkinTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#8B7CFF' },
    // TIMELINE with rings
    timelineWrap: {
        flexDirection: 'row', alignItems: 'flex-start',
    },
    timelineConnector: {
        flex: 1, height: 2, backgroundColor: 'rgba(139,124,255,0.3)', marginTop: 30,
    },
    timelineItem: { alignItems: 'center', width: 72 },
    timelineBubble: {
        width: 37, height: 37,
        borderRadius: 19, justifyContent: 'center', alignItems: 'center',
    },
    timelineLabel: { marginTop: 10, fontSize: 10, color: '#F7F8FC', fontWeight: '700' },
    completedDot: {
        width: 10, height: 10, borderRadius: 5, marginTop: 8,
        shadowOpacity: 0.7, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    pendingDot: {
        width: 10, height: 10, borderRadius: 5, marginTop: 8,
        borderWidth: 2, borderColor: '#6B7280', backgroundColor: '#1A2235',
    },
    // PRIME CARD
    primeCard: {
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: '#131929',
        borderRadius: 28,
        padding: 20,
        flexDirection: 'row',
        position: 'relative',
        shadowColor: '#8B7CFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    shareFloating: { position: 'absolute', right: 14, bottom: 14 },
    primeLeft: { width: '55%' },
    primeRight: { width: '31%' },
    primeTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    primeTag: { flexDirection: 'row', alignItems: 'center' },
    primeTagText: { marginLeft: 6, fontSize: 10, color: '#8B7CFF', fontWeight: '700' },
    weatherPill: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2235',
        borderRadius: 30, paddingHorizontal: 8, paddingVertical: 5,
    },
    weatherText: { marginLeft: 4, color: '#6B7280', fontSize: 9 },
    primeTitle: { fontSize: 20, fontWeight: '800', color: '#F7F8FC', marginTop: 22 },
    primeSub: { marginTop: 4, color: '#6B7280', fontSize: 15, lineHeight: 24 },
    levelSection: { marginTop: 30 },
    levelText: { color: '#8B7CFF', fontWeight: '800', fontSize: 10 },
    levelTrack: {
        width: 130, height: 4, borderRadius: 999, backgroundColor: '#1A2235',
        overflow: 'hidden', marginTop: 8,
    },
    levelFill: { height: 4, borderRadius: 999 },
    xpText: { color: '#8B7CFF', fontWeight: '600', fontSize: 9, marginTop: 8 },
    verticalDivider: { width: 1, backgroundColor: 'rgba(139,124,255,0.15)', marginHorizontal: 16 },
    metricDivider: { height: 1, backgroundColor: 'rgba(139,124,255,0.15)', marginVertical: 16 },
    // HEALTH OVERVIEW
    healthOverview: {
        marginHorizontal: 18, marginTop: 16, backgroundColor: '#131929',
        borderRadius: 28, paddingVertical: 16, paddingHorizontal: 6,
        borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)', flexDirection: 'row', justifyContent: 'space-between',
    },
    healthMiniCard: { width: '19%', alignItems: 'center' },
    iconGlowWrap: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: '#1A2235',
        justifyContent: 'center', alignItems: 'center',
    },
    healthMiniLabel: { marginTop: 8, fontSize: 8, fontWeight: '700' },
    healthMiniValue: { marginTop: 8, fontSize: 17, fontWeight: '800', color: '#F7F8FC' },
    healthMiniSub: { marginTop: 2, fontSize: 10, color: '#6B7280' },
    // OPTIMIZE TODAY
    optimizeCard: {
        marginHorizontal: 18, marginTop: 14, backgroundColor: '#131929',
        borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16,
        borderWidth: 1, borderColor: 'rgba(247,200,115,0.3)', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
    },
    optimizeLeft: { flex: 1, paddingRight: 10 },
    optimizeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    optimizeLabel: { marginLeft: 6, fontSize: 10, fontWeight: '800', color: '#F7C873' },
    optimizeItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    optimizeDot: {
        width: 5, height: 5, borderRadius: 3, backgroundColor: '#F7C873',
        marginTop: 5, marginRight: 7,
    },
    optimizeText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#6B7280' },
    optimizeButton: {
        height: 36, paddingHorizontal: 14, borderRadius: 14,
        backgroundColor: 'rgba(247,200,115,0.2)', justifyContent: 'center', alignItems: 'center',
    },
    optimizeButtonText: { color: '#F7C873', fontWeight: '700', fontSize: 12 },
    // MACROS BREAKDOWN
    fuelCard: {
        marginHorizontal: 18, marginTop: 12, backgroundColor: '#131929',
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)',
    },
    fuelHeader: { marginBottom: 14 },
    fuelTitleWrap: { flexDirection: 'row', alignItems: 'center' },
    fuelTitle: { marginLeft: 7, fontSize: 10, fontWeight: '800', color: '#F7F8FC' },
    macroRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6,
    },
    macroLabel: { fontSize: 9, fontWeight: '800', width: 52, letterSpacing: 0.5 },
    macroBarWrap: { flex: 1 },
    macroBar: { height: 7, backgroundColor: '#1A2235', borderRadius: 4, overflow: 'hidden' },
    macroFill: { height: '100%', borderRadius: 4 },
    macroValue: { fontSize: 11, fontWeight: '700', color: '#F7F8FC', width: 58, textAlign: 'right' },
    macroTarget: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
    macroStatus: { fontSize: 9, fontWeight: '800', width: 44, textAlign: 'right' },
});
