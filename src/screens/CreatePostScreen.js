"use strict";
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
exports.default = CreatePostScreen;
var react_1 = require("react");
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var AuthContext_1 = require("../context/AuthContext");
var supabase_1 = require("../lib/supabase");
var AchievementOrchestrator_1 = require("./gamification/services/AchievementOrchestrator");
var useGamificationStore_1 = require("./gamification/store/useGamificationStore");
var lucide_react_native_1 = require("lucide-react-native");
var MAX_CHARACTERS = 280;
function CreatePostScreen() {
    var _this = this;
    var navigation = (0, native_1.useNavigation)();
    var user = (0, AuthContext_1.useAuth)().user;
    var setPendingAchievement = (0, useGamificationStore_1.useGamificationStore)(function (state) { return state.setPendingAchievement; });
    var _a = (0, react_1.useState)(''), content = _a[0], setContent = _a[1];
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var handlePost = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var error, newAchievement, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!content.trim() || !user) {
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase_1.supabase.from('posts').insert({
                            user_id: user.id,
                            content: content.trim(),
                        })];
                case 2:
                    error = (_a.sent()).error;
                    if (error) {
                        throw error;
                    }
                    return [4 /*yield*/, AchievementOrchestrator_1.achievementOrchestrator.checkForNewAchievements(user.id)];
                case 3:
                    newAchievement = _a.sent();
                    if (newAchievement) {
                        setPendingAchievement(newAchievement);
                    }
                    // In a real app, you'd use a toast notification library
                    react_native_1.Alert.alert('Success', 'Your post has been published!');
                    navigation.goBack();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error creating post:', error_1);
                    react_native_1.Alert.alert('Error', 'Failed to publish your post. Please try again.');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [content, user, navigation]);
    var characterCount = content.length;
    var isPostDisabled = !content.trim() || characterCount > MAX_CHARACTERS || isLoading;
    return (react_1.default.createElement(react_native_1.View, { style: styles.container },
        react_1.default.createElement(react_native_1.View, { style: styles.header },
            react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.goBack(); }, style: styles.cancelButton },
                react_1.default.createElement(lucide_react_native_1.X, { size: 24, color: "#FFF" })),
            react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handlePost, style: [styles.postButton, isPostDisabled && styles.postButtonDisabled], disabled: isPostDisabled }, isLoading ? (react_1.default.createElement(react_native_1.ActivityIndicator, { size: "small", color: "#FFF" })) : (react_1.default.createElement(react_native_1.Text, { style: styles.postButtonText }, "Post")))),
        react_1.default.createElement(react_native_1.View, { style: styles.inputContainer },
            react_1.default.createElement(react_native_1.TextInput, { style: styles.textInput, multiline: true, placeholder: "What's on your mind?", placeholderTextColor: "#5A5A5A", value: content, onChangeText: setContent, autoFocus: true })),
        react_1.default.createElement(react_native_1.Text, { style: styles.charCount },
            characterCount,
            "/",
            MAX_CHARACTERS)));
}
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1020',
        paddingTop: 60,
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cancelButton: {
        padding: 5,
    },
    postButton: {
        backgroundColor: '#8B7CFF',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    postButtonDisabled: {
        backgroundColor: '#5A5A5A',
    },
    postButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputContainer: {
        flex: 1,
    },
    textInput: {
        color: '#FFF',
        fontSize: 18,
        lineHeight: 24,
        textAlignVertical: 'top',
        flex: 1,
    },
    charCount: {
        color: '#5A5A5A',
        textAlign: 'right',
        marginBottom: 20,
        paddingBottom: 20,
    },
});
