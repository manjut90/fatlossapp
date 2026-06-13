"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDailyScore = calculateDailyScore;
function calculateDailyScore(_a) {
    var calories = _a.calories, water = _a.water, workout = _a.workout, sleep = _a.sleep;
    var score = 0;
    /* FOOD */
    if (calories >= 1200) {
        score += 35;
    }
    /* WATER */
    if (water >= 3) {
        score += 25;
    }
    /* WORKOUT */
    if (workout) {
        score += 25;
    }
    /* SLEEP */
    if (sleep >= 7) {
        score += 15;
    }
    return Math.min(100, score);
}
