"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_THRESHOLDS = void 0;
exports.getLevelFromXP = getLevelFromXP;
exports.LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Beginner' },
    { level: 2, xp: 500, title: 'Starter' },
    { level: 3, xp: 1500, title: 'Momentum Builder' },
    { level: 4, xp: 3000, title: 'Consistency Machine' },
    { level: 5, xp: 5000, title: 'Transformation Zone' },
    { level: 6, xp: 8000, title: 'Elite Performer' },
    { level: 7, xp: 12000, title: 'LFGO Legend' },
];
function getLevelFromXP(totalXp) {
    var currentLevelIndex = -1;
    for (var i = exports.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= exports.LEVEL_THRESHOLDS[i].xp) {
            currentLevelIndex = i;
            break;
        }
    }
    // Fallback to level 1 if something goes wrong (e.g., negative XP)
    if (currentLevelIndex === -1) {
        currentLevelIndex = 0;
    }
    var currentLevelData = exports.LEVEL_THRESHOLDS[currentLevelIndex];
    var nextLevelData = exports.LEVEL_THRESHOLDS[currentLevelIndex + 1] || null;
    var level = currentLevelData.level, title = currentLevelData.title;
    var currentLevelXp = currentLevelData.xp;
    var nextLevelXp = nextLevelData ? nextLevelData.xp : null;
    var progressPercent = 0;
    if (nextLevelXp !== null) {
        var xpInCurrentLevel = totalXp - currentLevelXp;
        var xpToNextLevel = nextLevelXp - currentLevelXp;
        if (xpToNextLevel > 0) {
            progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;
        }
    }
    else {
        // This is the highest level
        progressPercent = 100;
    }
    return {
        level: level,
        title: title,
        currentLevelXp: currentLevelXp,
        nextLevelXp: nextLevelXp,
        progressPercent: Math.min(100, Math.max(0, progressPercent)), // Clamp between 0 and 100
    };
}
