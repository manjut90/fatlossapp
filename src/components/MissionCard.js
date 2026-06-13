"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionCard = MissionCard;
var react_1 = require("react");
var react_native_1 = require("react-native");
var lucide_react_native_1 = require("lucide-react-native");
var useDailyMission_1 = require("../hooks/useDailyMission");
var CATEGORY_CONFIG = {
    movement: { icon: lucide_react_native_1.Footprints, color: '#73F7C8', label: 'MOVEMENT' },
    hydration: { icon: lucide_react_native_1.Droplets, color: '#4AA9FF', label: 'HYDRATION' },
    nutrition: { icon: lucide_react_native_1.Utensils, color: '#FF8FA3', label: 'NUTRITION' },
};
function CategoryPill(_a) {
    var _b;
    var category = _a.category;
    var config = (_b = CATEGORY_CONFIG[category]) !== null && _b !== void 0 ? _b : CATEGORY_CONFIG.movement;
    var Icon = config.icon;
    return (react_1.default.createElement(react_native_1.View, { style: [styles.pill, { backgroundColor: "".concat(config.color, "18") }] },
        react_1.default.createElement(Icon, { size: 10, color: config.color }),
        react_1.default.createElement(react_native_1.Text, { style: [styles.pillText, { color: config.color }] }, config.label)));
}
function MissionRow(_a) {
    var mission = _a.mission, index = _a.index, completed = _a.completed, onComplete = _a.onComplete;
    // Animation values
    var xpAnimation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var rowAnimation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var prevCompletedRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        var prevCompleted = prevCompletedRef.current;
        if (prevCompleted === false && completed === true) {
            react_native_1.Animated.parallel([
                // Row fade and scale animation
                react_native_1.Animated.timing(rowAnimation, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                // Floating XP text animation
                react_native_1.Animated.timing(xpAnimation, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        prevCompletedRef.current = completed;
    }, [completed, rowAnimation, xpAnimation]);
    // Interpolate styles from animation values
    var rowStyle = {
        opacity: rowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.7],
        }),
        transform: [
            {
                scale: rowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.98],
                }),
            },
        ],
    };
    var xpStyle = {
        opacity: xpAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
        }),
        transform: [
            {
                translateY: xpAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                }),
            },
        ],
    };
    return (react_1.default.createElement(react_native_1.Animated.View, { style: [styles.missionRow, completed && styles.missionRowDone, rowStyle] },
        react_1.default.createElement(react_native_1.Animated.Text, { style: [styles.xpFloating, xpStyle] },
            "+",
            mission.xp,
            " XP"),
        react_1.default.createElement(react_native_1.View, { style: styles.missionLeft },
            react_1.default.createElement(react_native_1.View, { style: styles.missionMeta },
                react_1.default.createElement(CategoryPill, { category: mission.category }),
                react_1.default.createElement(react_native_1.View, { style: styles.xpPill },
                    react_1.default.createElement(lucide_react_native_1.Zap, { size: 9, color: "#F7C873" }),
                    react_1.default.createElement(react_native_1.Text, { style: styles.xpText },
                        "+",
                        mission.xp,
                        " XP"))),
            react_1.default.createElement(react_native_1.Text, { style: [styles.missionTitle, completed && styles.missionTitleDone] }, mission.title),
            react_1.default.createElement(react_native_1.Text, { style: styles.missionDesc }, mission.description)),
        react_1.default.createElement(react_native_1.TouchableOpacity, { style: [styles.doneBtn, completed && styles.doneBtnDone], onPress: onComplete, disabled: completed, activeOpacity: 0.75 }, completed
            ? react_1.default.createElement(lucide_react_native_1.CheckCircle, { size: 18, color: "#22C55E" })
            : react_1.default.createElement(react_native_1.Text, { style: styles.doneBtnText }, "Done"))));
}
function MissionCard() {
    var _a = (0, useDailyMission_1.useDailyMission)(), mission = _a.mission, loading = _a.loading, completeMission = _a.completeMission;
    if (loading) {
        return (react_1.default.createElement(react_native_1.View, { style: styles.card },
            react_1.default.createElement(react_native_1.ActivityIndicator, { color: "#8B7CFF" }),
            react_1.default.createElement(react_native_1.Text, { style: styles.loadingText }, "Coach is preparing your mission...")));
    }
    if (!mission)
        return null;
    var allDone = mission.missions.length > 0 &&
        mission.missions.every(function (_, i) { return mission.completed_missions.includes(i); });
    return (react_1.default.createElement(react_native_1.View, { style: styles.card },
        react_1.default.createElement(react_native_1.View, { style: styles.header },
            react_1.default.createElement(lucide_react_native_1.Zap, { size: 12, color: "#8B7CFF" }),
            react_1.default.createElement(react_native_1.Text, { style: styles.headerText }, "NEO'S MISSION FOR TODAY"),
            allDone && react_1.default.createElement(react_native_1.Text, { style: styles.allDoneText }, "\u2713 COMPLETE")),
        react_1.default.createElement(react_native_1.Text, { style: styles.coachSubtle }, "Neo prepared this mission based on your recent progress."),
        react_1.default.createElement(react_native_1.Text, { style: styles.coachMsg },
            "\"",
            mission.coach_message,
            "\""),
        react_1.default.createElement(react_native_1.View, { style: styles.divider }),
        mission.missions.map(function (m, i) { return (react_1.default.createElement(MissionRow, { key: i, mission: m, index: i, completed: mission.completed_missions.includes(i), onComplete: function () { return completeMission(i); } })); })));
}
var styles = react_native_1.StyleSheet.create({
    card: {
        marginHorizontal: 18,
        marginTop: 16,
        backgroundColor: '#131929',
        borderRadius: 28,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(139,124,255,0.2)',
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#8B7CFF',
        letterSpacing: 1,
        flex: 1,
    },
    allDoneText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#22C55E',
        letterSpacing: 1,
    },
    coachMsg: {
        fontSize: 13,
        color: '#6B7280',
        fontStyle: 'italic',
        lineHeight: 19,
    },
    coachSubtle: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(139,124,255,0.15)',
    },
    missionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0B1020',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(139,124,255,0.1)',
        gap: 12,
    },
    missionRowDone: {
        opacity: 0.5,
        borderColor: 'rgba(34,197,94,0.2)',
    },
    missionLeft: {
        flex: 1,
        gap: 6,
    },
    missionMeta: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 999,
    },
    pillText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    xpPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(247,200,115,0.1)',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 999,
    },
    xpText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#F7C873',
    },
    xpFloating: {
        position: 'absolute',
        top: 10,
        right: 20,
        fontSize: 14,
        fontWeight: '900',
        color: '#F7C873',
        zIndex: 1,
    },
    missionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#F7F8FC',
    },
    missionTitleDone: {
        textDecorationLine: 'line-through',
        color: '#6B7280',
    },
    missionDesc: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 17,
    },
    doneBtn: {
        backgroundColor: '#8B7CFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 9,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 52,
    },
    doneBtnDone: {
        backgroundColor: 'rgba(34,197,94,0.1)',
    },
    doneBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0B1020',
    },
    loadingText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 6,
    },
});
