"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionTemplates = void 0;
exports.getFallbackTemplate = getFallbackTemplate;
exports.missionTemplates = {
    movement: [
        {
            title: '10 Minute Walk',
            description: 'Walk for 10 minutes after your next meal.',
            category: 'movement',
            xp: 50,
        },
        {
            title: '5000 Steps',
            description: 'Reach 5000 total steps today.',
            category: 'movement',
            xp: 75,
        },
        {
            title: '15 Minute Workout',
            description: 'Complete a short workout session.',
            category: 'movement',
            xp: 100,
        },
    ],
    hydration: [
        {
            title: 'Drink 1.5L Water',
            description: 'Finish 1.5L before 6 PM.',
            category: 'hydration',
            xp: 50,
        },
        {
            title: 'Hydration Check',
            description: 'Log water intake 3 times today.',
            category: 'hydration',
            xp: 75,
        },
    ],
    nutrition: [
        {
            title: 'Protein Goal',
            description: 'Hit your protein target today.',
            category: 'nutrition',
            xp: 100,
        },
        {
            title: 'Healthy Meal',
            description: 'Log one balanced meal today.',
            category: 'nutrition',
            xp: 50,
        },
    ],
};
var FALLBACK_PAIRS = [
    {
        missions: [
            exports.missionTemplates.movement[0],
            exports.missionTemplates.hydration[0],
        ],
        coach_message: "Simple day. Two small wins. That's all I need from you.",
    },
    {
        missions: [
            exports.missionTemplates.nutrition[0],
            exports.missionTemplates.hydration[0],
        ],
        coach_message: 'Nutrition and hydration. The unsexy stuff that actually works.',
    },
    {
        missions: [
            exports.missionTemplates.movement[0],
            exports.missionTemplates.nutrition[0],
        ],
        coach_message: 'Movement and clean fuel. You know what to do.',
    },
];
function getFallbackTemplate(date) {
    var d = new Date(date);
    var start = new Date(d.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
    return FALLBACK_PAIRS[dayOfYear % FALLBACK_PAIRS.length];
}
