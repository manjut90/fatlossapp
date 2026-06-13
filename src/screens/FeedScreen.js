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
exports.default = FeedScreen;
var react_1 = require("react");
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var expo_linear_gradient_1 = require("expo-linear-gradient");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var lucide_react_native_1 = require("lucide-react-native");
var vector_icons_1 = require("@expo/vector-icons");
var AuthContext_1 = require("../context/AuthContext");
var supabase_1 = require("../services/supabase");
var PostViewerModal_1 = require("../components/profile/PostViewerModal");
var ImagePicker = require("expo-image-picker");
var FileSystem = require("expo-file-system");
var base64_arraybuffer_1 = require("base64-arraybuffer");
var level_1 = require("../services/level");
var AchievementOrchestrator_1 = require("./gamification/services/AchievementOrchestrator");
var _a = react_native_1.Dimensions.get('window'), screenWidth = _a.width, screenHeight = _a.height;
// =================================================================
// Story Viewer Modal
// =================================================================
var StoryViewerModal = function (_a) {
    var _b, _c, _d;
    var story = _a.story, visible = _a.visible, onClose = _a.onClose;
    if (!story)
        return null;
    var user = (0, AuthContext_1.useAuth)().user;
    var _e = (0, react_1.useState)(''), replyText = _e[0], setReplyText = _e[1];
    var handleReply = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!replyText.trim() || !(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    // REQUIRED: Create 'story_replies' table in Supabase with columns: id, story_id, user_id, message, created_at
                    return [4 /*yield*/, supabase_1.supabase.from('story_replies').insert({
                            story_id: story.id,
                            user_id: user.id,
                            message: replyText,
                        }).then(function () { return setReplyText(''); })];
                case 1:
                    // REQUIRED: Create 'story_replies' table in Supabase with columns: id, story_id, user_id, message, created_at
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement(react_native_1.Modal, { visible: visible, animationType: "slide", onRequestClose: onClose, statusBarTranslucent: true },
        react_1.default.createElement(react_native_1.KeyboardAvoidingView, { style: styles.storyModalContainer, behavior: react_native_1.Platform.OS === 'ios' ? 'padding' : 'height' },
            react_1.default.createElement(react_native_1.View, { style: styles.storyModalHeader },
                react_1.default.createElement(react_native_1.Image, { source: { uri: ((_b = story.profiles) === null || _b === void 0 ? void 0 : _b.avatar_url) || 'https://i.pravatar.cc/150' }, style: styles.storyModalAvatar }),
                react_1.default.createElement(react_native_1.Text, { style: styles.storyModalUsername }, ((_c = story.profiles) === null || _c === void 0 ? void 0 : _c.full_name) || ((_d = story.profiles) === null || _d === void 0 ? void 0 : _d.username) || 'Member'),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onClose, style: styles.storyModalClose },
                    react_1.default.createElement(lucide_react_native_1.X, { size: 32, color: "#FFF" }))),
            react_1.default.createElement(react_native_1.Image, { source: { uri: story.image_url }, style: styles.storyModalImage, resizeMode: "contain" }),
            react_1.default.createElement(react_native_1.View, { style: styles.storyModalInputContainer },
                react_1.default.createElement(react_native_1.TextInput, { style: styles.storyModalInput, placeholder: "Send message...", placeholderTextColor: "#999", value: replyText, onChangeText: setReplyText }),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleReply },
                    react_1.default.createElement(vector_icons_1.Feather, { name: "send", size: 24, color: "#FFF" }))))));
};
// =================================================================
// Post Card (For Posts Tab)
// =================================================================
var getRankBadge = function (xp) {
    if (xp === void 0) { xp = 0; }
    if (xp >= 10000)
        return { label: 'Ascendant', color: '#8B7CFF', bg: 'rgba(139,124,255,0.2)' };
    if (xp >= 5000)
        return { label: 'Diamond', color: '#60C8FF', bg: 'rgba(96,200,255,0.2)' };
    if (xp >= 2000)
        return { label: 'Gold', color: '#F7C873', bg: 'rgba(247,200,115,0.2)' };
    if (xp >= 500)
        return { label: 'Silver', color: '#C9D0DA', bg: 'rgba(201,208,218,0.2)' };
    return { label: 'Bronze', color: '#C27A5B', bg: 'rgba(194,122,91,0.2)' };
};
var PostCard = function (_a) {
    var _b, _c, _d, _e, _f;
    var post = _a.post;
    var navigation = (0, native_1.useNavigation)();
    var user = (0, AuthContext_1.useAuth)().user;
    var _g = (0, react_1.useState)(false), isLiked = _g[0], setIsLiked = _g[1];
    var _h = (0, react_1.useState)(post.likes_count || 0), likesCount = _h[0], setLikesCount = _h[1];
    var _j = (0, react_1.useState)(false), isBookmarked = _j[0], setIsBookmarked = _j[1];
    (0, react_1.useEffect)(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id) || !(post === null || post === void 0 ? void 0 : post.id))
            return;
        supabase_1.supabase
            .from('reactions')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single()
            .then(function (_a) {
            var data = _a.data;
            if (data)
                setIsLiked(true);
        });
    }, [post === null || post === void 0 ? void 0 : post.id, user === null || user === void 0 ? void 0 : user.id]);
    (0, react_1.useEffect)(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id) || !(post === null || post === void 0 ? void 0 : post.id))
            return;
        supabase_1.supabase
            .from('bookmarks')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single()
            .then(function (_a) {
            var data = _a.data;
            if (data)
                setIsBookmarked(true);
        });
    }, [post === null || post === void 0 ? void 0 : post.id, user === null || user === void 0 ? void 0 : user.id]);
    // REQUIRED: Create 'bookmarks' table in Supabase with columns: id, post_id, user_id, created_at
    // RLS: Users can insert/delete own bookmarks
    var handleBookmark = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    newState = !isBookmarked;
                    setIsBookmarked(newState);
                    if (!newState) return [3 /*break*/, 2];
                    return [4 /*yield*/, supabase_1.supabase.from('bookmarks').insert({ post_id: post.id, user_id: user.id })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, supabase_1.supabase.from('bookmarks').delete().eq('post_id', post.id).eq('user_id', user.id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLike = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newLikedState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    newLikedState = !isLiked;
                    setIsLiked(newLikedState);
                    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);
                    if (!newLikedState) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type: 'like' })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, supabase_1.supabase.from('posts').update({ likes_count: likesCount + 1 }).eq('id', post.id)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, supabase_1.supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, supabase_1.supabase.from('posts').update({ likes_count: Math.max(0, likesCount - 1) }).eq('id', post.id)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleShare = function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, react_native_1.Share.share({ message: post.image_url ? "Check this out on LFGO! ".concat(post.image_url) : post.content || 'Check this out on LFGO!' })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var timeAgo = function (dateString) {
        if (!dateString)
            return '';
        var date = new Date(dateString);
        var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        var interval = seconds / 31536000;
        if (interval > 1)
            return "".concat(Math.floor(interval), "y");
        interval = seconds / 2592000;
        if (interval > 1)
            return "".concat(Math.floor(interval), "mo");
        interval = seconds / 86400;
        if (interval > 1)
            return "".concat(Math.floor(interval), "d");
        interval = seconds / 3600;
        if (interval > 1)
            return "".concat(Math.floor(interval), "h");
        interval = seconds / 60;
        if (interval > 1)
            return "".concat(Math.floor(interval), "m");
        return "".concat(Math.floor(seconds), "s");
    };
    return (react_1.default.createElement(react_native_1.View, { style: styles.postCard },
        react_1.default.createElement(react_native_1.View, { style: styles.postHeader },
            react_1.default.createElement(react_native_1.Image, { source: { uri: ((_b = post.profiles) === null || _b === void 0 ? void 0 : _b.avatar_url) || 'https://i.pravatar.cc/150' }, style: styles.postAvatar }),
            react_1.default.createElement(react_native_1.Text, { style: styles.postUsername }, ((_c = post.profiles) === null || _c === void 0 ? void 0 : _c.full_name) || ((_d = post.profiles) === null || _d === void 0 ? void 0 : _d.username) || 'Member'),
            (function () {
                var _a, _b;
                var rank = getRankBadge(((_a = post.profiles) === null || _a === void 0 ? void 0 : _a.xp) || 0);
                return (react_1.default.createElement(react_native_1.View, { style: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: rank.bg, marginLeft: 6, flexDirection: 'row', gap: 3 } },
                    react_1.default.createElement(react_native_1.Text, { style: { fontSize: 9, fontWeight: '800', color: rank.color } }, rank.label),
                    react_1.default.createElement(react_native_1.Text, { style: { fontSize: 9, fontWeight: '600', color: rank.color } },
                        "Lv.",
                        (0, level_1.getLevel)(((_b = post.profiles) === null || _b === void 0 ? void 0 : _b.xp) || 0))));
            })(),
            react_1.default.createElement(react_native_1.TouchableOpacity, { style: { marginLeft: 'auto' }, onPress: function () { return react_native_1.Alert.alert('Post Options', '', [
                    { text: 'Report', onPress: function () { return react_native_1.Alert.alert('Reported', 'Thank you for your feedback.'); } },
                    { text: 'Copy Link', onPress: function () { } },
                    { text: post.user_id === (user === null || user === void 0 ? void 0 : user.id) ? 'Delete Post' : 'Hide Post',
                        style: 'destructive',
                        onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(post.user_id === (user === null || user === void 0 ? void 0 : user.id))) return [3 /*break*/, 2];
                                        return [4 /*yield*/, supabase_1.supabase.from('posts').delete().eq('id', post.id)];
                                    case 1:
                                        _a.sent();
                                        react_native_1.Alert.alert('Deleted', 'Your post has been removed.');
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); }
                    },
                    { text: 'Cancel', style: 'cancel' },
                ]); } },
                react_1.default.createElement(lucide_react_native_1.MoreHorizontal, { size: 24, color: "#F7F8FC" }))),
        react_1.default.createElement(react_native_1.Image, { source: { uri: post.image_url }, style: styles.postImage }),
        react_1.default.createElement(react_native_1.View, { style: styles.postActions },
            react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', gap: 16 } },
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleLike },
                    react_1.default.createElement(lucide_react_native_1.Heart, { size: 26, color: isLiked ? "#E0245E" : "#F7F8FC", fill: isLiked ? "#E0245E" : "none" })),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.navigate('Comments', { postId: post.id }); } },
                    react_1.default.createElement(lucide_react_native_1.MessageCircle, { size: 26, color: "#F7F8FC" })),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleShare },
                    react_1.default.createElement(vector_icons_1.Feather, { name: "send", size: 26, color: "#F7F8FC" }))),
            react_1.default.createElement(react_native_1.TouchableOpacity, { style: { marginLeft: 'auto' }, onPress: handleBookmark },
                react_1.default.createElement(lucide_react_native_1.Bookmark, { size: 26, color: "#F7F8FC", fill: isBookmarked ? "#F7F8FC" : "none" }))),
        react_1.default.createElement(react_native_1.Text, { style: styles.likes },
            likesCount,
            " likes"),
        react_1.default.createElement(react_native_1.Text, { style: { color: '#F7C873', fontSize: 11, fontWeight: '700', paddingHorizontal: 12, marginBottom: 4 } },
            "+",
            Math.floor(Math.random() * 50) + 10,
            " XP"),
        react_1.default.createElement(react_native_1.Text, { style: styles.caption, numberOfLines: 2 },
            react_1.default.createElement(react_native_1.Text, { style: styles.captionUsername },
                ((_e = post.profiles) === null || _e === void 0 ? void 0 : _e.full_name) || ((_f = post.profiles) === null || _f === void 0 ? void 0 : _f.username) || 'Member',
                " "),
            post.content),
        react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.navigate('Comments', { postId: post.id }); } },
            react_1.default.createElement(react_native_1.Text, { style: styles.viewComments },
                "View all ",
                post.comments_count || 0,
                " comments")),
        react_1.default.createElement(react_native_1.Text, { style: styles.timestamp }, timeAgo(post.created_at))));
};
// =================================================================
// Reel Item (For Reels Tab)
// =================================================================
var ReelItem = function (_a) {
    var _b, _c, _d;
    var post = _a.post;
    var navigation = (0, native_1.useNavigation)();
    var user = (0, AuthContext_1.useAuth)().user;
    var _e = (0, react_1.useState)(false), isReelLiked = _e[0], setIsReelLiked = _e[1];
    var _f = (0, react_1.useState)(post.likes_count || 0), reelLikes = _f[0], setReelLikes = _f[1];
    var handleReelLike = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newState, newLikesCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    newState = !isReelLiked;
                    setIsReelLiked(newState);
                    newLikesCount = newState ? reelLikes + 1 : Math.max(0, reelLikes - 1);
                    setReelLikes(newLikesCount);
                    if (!newState) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type: 'like' })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, supabase_1.supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', post.id)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, supabase_1.supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, supabase_1.supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', post.id)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (react_1.default.createElement(react_native_1.View, { style: styles.reelItemContainer },
        react_1.default.createElement(react_native_1.Image, { source: { uri: post.image_url }, style: styles.reelImage }),
        react_1.default.createElement(react_native_1.View, { style: styles.reelOverlay },
            react_1.default.createElement(react_native_1.View, { style: styles.reelDetails },
                react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 } },
                    react_1.default.createElement(react_native_1.Image, { source: { uri: ((_b = post.profiles) === null || _b === void 0 ? void 0 : _b.avatar_url) || 'https://i.pravatar.cc/150' }, style: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#8B7CFF' } }),
                    react_1.default.createElement(react_native_1.View, null,
                        react_1.default.createElement(react_native_1.Text, { style: styles.reelUsername },
                            "@",
                            ((_c = post.profiles) === null || _c === void 0 ? void 0 : _c.full_name) || ((_d = post.profiles) === null || _d === void 0 ? void 0 : _d.username) || 'Member'),
                        (function () {
                            var _a, _b;
                            var rank = getRankBadge(((_a = post.profiles) === null || _a === void 0 ? void 0 : _a.xp) || 0);
                            var level = (0, level_1.getLevel)(((_b = post.profiles) === null || _b === void 0 ? void 0 : _b.xp) || 0);
                            return (react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', alignItems: 'center', gap: 4 } },
                                react_1.default.createElement(react_native_1.View, { style: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: rank.bg } },
                                    react_1.default.createElement(react_native_1.Text, { style: { fontSize: 9, fontWeight: '800', color: rank.color } }, rank.label)),
                                react_1.default.createElement(react_native_1.Text, { style: { fontSize: 9, color: '#F7C873', fontWeight: '700' } },
                                    "Lv.",
                                    level)));
                        })())),
                react_1.default.createElement(react_native_1.Text, { style: styles.reelCaption, numberOfLines: 2 }, post.content)),
            react_1.default.createElement(react_native_1.View, { style: styles.reelActions },
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.reelActionBtn, onPress: handleReelLike },
                    react_1.default.createElement(lucide_react_native_1.Heart, { size: 28, color: isReelLiked ? '#E0245E' : '#FFF', fill: isReelLiked ? '#E0245E' : 'none' }),
                    react_1.default.createElement(react_native_1.Text, { style: styles.reelActionText }, reelLikes)),
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.reelActionBtn, onPress: function () { return navigation.navigate('Comments', { postId: post.id }); } },
                    react_1.default.createElement(lucide_react_native_1.MessageCircle, { size: 28, color: "#FFF" }),
                    react_1.default.createElement(react_native_1.Text, { style: styles.reelActionText }, post.comments_count || 0)),
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.reelActionBtn, onPress: function () { return react_native_1.Share.share({ message: post.image_url }); } },
                    react_1.default.createElement(lucide_react_native_1.Share2, { size: 28, color: "#FFF" })),
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.reelActionBtn },
                    react_1.default.createElement(lucide_react_native_1.Bookmark, { size: 28, color: "#FFF" }))))));
};
// =================================================================
// Main Feed Screen
// =================================================================
// REQUIRED in Supabase:
// 1. Create storage bucket 'stories' (public)
// 2. Create table 'stories': id, user_id, image_url, expires_at, created_at
// 3. Add RLS: authenticated users can insert own stories
// 4. Add RLS: public can view stories
function FeedScreen() {
    var _this = this;
    var _a;
    var _b = (0, react_1.useState)([]), posts = _b[0], setPosts = _b[1];
    var _c = (0, react_1.useState)([]), stories = _c[0], setStories = _c[1];
    var _d = (0, react_1.useState)('Posts'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)(false), storyModalVisible = _e[0], setStoryModalVisible = _e[1];
    var _f = (0, react_1.useState)(null), selectedStory = _f[0], setSelectedStory = _f[1];
    var _g = (0, react_1.useState)(false), postViewerVisible = _g[0], setPostViewerVisible = _g[1];
    var _h = (0, react_1.useState)(null), selectedPost = _h[0], setSelectedPost = _h[1];
    var user = (0, AuthContext_1.useAuth)().user;
    var navigation = (0, native_1.useNavigation)();
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var fetchFeedData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, postsData, error, userIds, profilesData, _b, merged, storiesData, storyUserIds, storyProfiles, _c, mergedStories;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('posts')
                        .select('*')
                        .order('created_at', { ascending: false })];
                case 1:
                    _a = _d.sent(), postsData = _a.data, error = _a.error;
                    if (error) {
                        return [2 /*return*/];
                    }
                    userIds = __spreadArray([], new Set((postsData || []).map(function (p) { return p.user_id; })), true);
                    if (!(userIds.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase.from('profiles').select('id,username,avatar_url,full_name,xp').in('id', userIds)];
                case 2:
                    _b = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _b = { data: [] };
                    _d.label = 4;
                case 4:
                    profilesData = (_b).data;
                    merged = (postsData || []).map(function (post) { return (__assign(__assign({}, post), { profiles: (profilesData === null || profilesData === void 0 ? void 0 : profilesData.find(function (p) { return p.id === post.user_id; })) || null })); });
                    setPosts(merged);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('stories')
                            .select('*')
                            .gt('expires_at', new Date().toISOString())
                            .order('created_at', { ascending: false })];
                case 5:
                    storiesData = (_d.sent()).data;
                    storyUserIds = __spreadArray([], new Set((storiesData || []).map(function (s) { return s.user_id; })), true);
                    if (!(storyUserIds.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, supabase_1.supabase.from('profiles').select('id,username,avatar_url,full_name').in('id', storyUserIds)];
                case 6:
                    _c = _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _c = { data: [] };
                    _d.label = 8;
                case 8:
                    storyProfiles = (_c).data;
                    mergedStories = (storiesData || []).map(function (s) { return (__assign(__assign({}, s), { profiles: (storyProfiles === null || storyProfiles === void 0 ? void 0 : storyProfiles.find(function (p) { return p.id === s.user_id; })) || null })); });
                    setStories(mergedStories);
                    return [2 /*return*/];
            }
        });
    }); };
    (0, native_1.useFocusEffect)(react_1.default.useCallback(function () {
        fetchFeedData();
    }, []));
    var handleAddStory = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, asset, ext, fileName, filePath, base64, uploadError, urlData, expiresAt, dbError, newAchievement, e_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [9, 16],
                            quality: 0.8,
                        })];
                case 1:
                    result = _b.sent();
                    if (result.canceled || !((_a = result.assets) === null || _a === void 0 ? void 0 : _a[0]))
                        return [2 /*return*/];
                    asset = result.assets[0];
                    ext = asset.uri.split('.').pop() || 'jpg';
                    fileName = "story_".concat(Date.now(), ".").concat(ext);
                    filePath = "".concat(user === null || user === void 0 ? void 0 : user.id, "/").concat(fileName);
                    return [4 /*yield*/, FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' })];
                case 2:
                    base64 = _b.sent();
                    return [4 /*yield*/, supabase_1.supabase.storage
                            .from('stories')
                            .upload(filePath, (0, base64_arraybuffer_1.decode)(base64), { contentType: "image/".concat(ext), upsert: true })];
                case 3:
                    uploadError = (_b.sent()).error;
                    if (uploadError) {
                        react_native_1.Alert.alert('Upload failed', uploadError.message);
                        return [2 /*return*/];
                    }
                    urlData = supabase_1.supabase.storage.from('stories').getPublicUrl(filePath).data;
                    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    return [4 /*yield*/, supabase_1.supabase.from('stories').insert({
                            user_id: user === null || user === void 0 ? void 0 : user.id,
                            image_url: urlData.publicUrl,
                            expires_at: expiresAt,
                            created_at: new Date().toISOString(),
                        })];
                case 4:
                    dbError = (_b.sent()).error;
                    if (dbError) {
                        react_native_1.Alert.alert('Error', dbError.message);
                        return [2 /*return*/];
                    }
                    react_native_1.Alert.alert('Story posted!', 'Your story will disappear in 24 hours.');
                    fetchFeedData();
                    return [4 /*yield*/, AchievementOrchestrator_1.achievementOrchestrator.checkForNewAchievements(user.id)];
                case 5:
                    newAchievement = _b.sent();
                    if (newAchievement) {
                        // TODO: Handle achievement display if needed in the future
                    }
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _b.sent();
                    react_native_1.Alert.alert('Error', e_2.message || 'Something went wrong.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var openStory = function (story) {
        setSelectedStory(story);
        setStoryModalVisible(true);
    };
    var openPost = function (post) {
        setSelectedPost(post);
        setPostViewerVisible(true);
    };
    var renderContent = function () {
        switch (activeTab) {
            case 'Posts':
                return react_1.default.createElement(react_native_1.FlatList, { data: posts, keyExtractor: function (item) { return item.id; }, renderItem: function (_a) {
                        var item = _a.item;
                        return react_1.default.createElement(PostCard, { post: item });
                    }, showsVerticalScrollIndicator: false, contentContainerStyle: { backgroundColor: '#0B1020', paddingTop: 8 } });
            case 'Reels':
                return react_1.default.createElement(react_native_1.ScrollView, { pagingEnabled: true, horizontal: false, showsVerticalScrollIndicator: false }, posts.map(function (p) { return react_1.default.createElement(ReelItem, { key: p.id, post: p }); }));
            default:
                return null;
        }
    };
    return (react_1.default.createElement(react_native_1.View, { style: [styles.container] },
        react_1.default.createElement(react_native_1.StatusBar, { barStyle: "light-content" }),
        react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 16, borderBottomWidth: 0 } },
            react_1.default.createElement(react_native_1.Text, { style: { fontSize: 28, fontWeight: '900', color: '#F7F8FC', letterSpacing: -0.5 } },
                "LF",
                react_1.default.createElement(react_native_1.Text, { style: { color: '#8B7CFF' } }, "GO")),
            react_1.default.createElement(react_native_1.View, { style: { flexDirection: 'row', gap: 12 } },
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () { return navigation.navigate('Notifications'); }, style: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#131929', alignItems: 'center', justifyContent: 'center' } },
                    react_1.default.createElement(lucide_react_native_1.Bell, { size: 20, color: "#F7F8FC" })),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: function () {
                        console.log('[MESSAGES BUTTON PRESSED]');
                        try {
                            navigation.navigate('Messages');
                            console.log('[NAVIGATION CALLED]');
                        }
                        catch (e) {
                            console.error('[NAV ERROR]', e);
                        }
                    }, style: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#131929', alignItems: 'center', justifyContent: 'center' } },
                    react_1.default.createElement(lucide_react_native_1.MessageSquare, { size: 20, color: "#F7F8FC" })))),
        react_1.default.createElement(react_native_1.View, { style: styles.storiesContainer },
            react_1.default.createElement(react_native_1.ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false },
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.storyContainer, onPress: handleAddStory },
                    react_1.default.createElement(react_native_1.View, null,
                        react_1.default.createElement(react_native_1.Image, { source: { uri: ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.avatar_url) || 'https://i.pravatar.cc/150' }, style: styles.storyAvatar }),
                        react_1.default.createElement(react_native_1.View, { style: styles.yourStoryPlus },
                            react_1.default.createElement(lucide_react_native_1.Plus, { size: 16, color: "#FFF" }))),
                    react_1.default.createElement(react_native_1.Text, { style: styles.storyUsername }, "Your story")),
                stories.slice(0, 10).map(function (p) {
                    var _a, _b, _c;
                    return (react_1.default.createElement(react_native_1.TouchableOpacity, { key: p.id, style: styles.storyContainer, onPress: function () { return openStory(p); } },
                        react_1.default.createElement(expo_linear_gradient_1.LinearGradient, { colors: ['#8B7CFF', '#FF6B6B', '#FF8C42'], style: styles.storyRingGradient },
                            react_1.default.createElement(react_native_1.View, { style: styles.storyRingInner },
                                react_1.default.createElement(react_native_1.Image, { source: { uri: ((_a = p.profiles) === null || _a === void 0 ? void 0 : _a.avatar_url) || 'https://i.pravatar.cc/150' }, style: styles.storyAvatar }))),
                        react_1.default.createElement(react_native_1.Text, { style: styles.storyUsername }, (((_b = p.profiles) === null || _b === void 0 ? void 0 : _b.full_name) || ((_c = p.profiles) === null || _c === void 0 ? void 0 : _c.username) || 'Member').slice(0, 8))));
                }))),
        react_1.default.createElement(react_native_1.View, { style: {
                flexDirection: 'row',
                marginHorizontal: 0,
                paddingHorizontal: 40,
                marginTop: 4,
                marginBottom: 0,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.1)',
            } }, [
            { id: 'Posts', icon: 'grid' },
            { id: 'Reels', icon: 'play' },
        ].map(function (tab) { return (react_1.default.createElement(react_native_1.TouchableOpacity, { key: tab.id, onPress: function () { return setActiveTab(tab.id); }, style: {
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab.id ? '#F7F8FC' : 'transparent',
            } }, tab.id === 'Posts'
            ? react_1.default.createElement(lucide_react_native_1.Grid, { size: 20, color: activeTab === tab.id ? '#F7F8FC' : '#6B7280' })
            : react_1.default.createElement(lucide_react_native_1.Play, { size: 20, color: activeTab === tab.id ? '#F7F8FC' : '#6B7280' }))); })),
        react_1.default.createElement(react_native_1.View, { style: styles.contentContainer }, renderContent()),
        react_1.default.createElement(StoryViewerModal, { story: selectedStory, visible: storyModalVisible, onClose: function () { return setStoryModalVisible(false); } }),
        selectedPost && react_1.default.createElement(PostViewerModal_1.default, { post: selectedPost, visible: postViewerVisible, onClose: function () { return setPostViewerVisible(false); } })));
}
// =================================================================
// Styles
// =================================================================
var styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B1020' },
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F7F8FC' },
    headerIcons: { flexDirection: 'row' },
    // Stories
    storiesContainer: { paddingVertical: 10, paddingLeft: 12, borderBottomWidth: 0, marginBottom: 0 },
    storyContainer: { alignItems: 'center', marginRight: 14 },
    storyRingGradient: { width: 96, height: 96, borderRadius: 48, padding: 2, justifyContent: 'center', alignItems: 'center' },
    storyRingInner: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#FFF', overflow: 'hidden' },
    storyAvatar: { width: 90, height: 90, borderRadius: 45 },
    storyUsername: { fontSize: 10, marginTop: 4, maxWidth: 90, color: '#6B7280' },
    yourStoryPlus: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B7CFF', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B1020' },
    // Tabs
    // Styles are now inline for the segmented control
    // Content
    contentContainer: { flex: 1 },
    // Post Card
    postCard: { backgroundColor: '#0F1624', borderWidth: 0, borderBottomColor: 'rgba(139,124,255,0.1)', borderBottomWidth: 1, marginBottom: 8 },
    postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    postUsername: { fontWeight: 'bold', fontSize: 14, color: '#F7F8FC' },
    postImage: { width: '100%', aspectRatio: 1 },
    postActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 12 },
    likes: { fontWeight: 'bold', paddingHorizontal: 12, fontSize: 14, marginTop: 8, color: '#F7F8FC' },
    caption: { paddingHorizontal: 12, marginTop: 4, fontSize: 14, color: '#F7F8FC' },
    captionUsername: { fontWeight: 'bold', color: '#F7F8FC' },
    viewComments: { color: '#6B7280', paddingHorizontal: 12, marginTop: 4, fontSize: 14 },
    timestamp: { color: '#6B7280', paddingHorizontal: 12, marginTop: 4, fontSize: 11 },
    // Reel Item
    reelItemContainer: { width: screenWidth, height: screenHeight - 250, backgroundColor: '#000' },
    reelImage: __assign({}, react_native_1.StyleSheet.absoluteFillObject),
    reelOverlay: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { justifyContent: 'flex-end', padding: 16, flexDirection: 'row' }),
    reelDetails: { flex: 1, justifyContent: 'flex-end' },
    reelUsername: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    reelCaption: { color: '#FFF', marginTop: 4, fontSize: 13 },
    reelActions: { justifyContent: 'flex-end', gap: 16 },
    reelActionBtn: { alignItems: 'center', gap: 6 },
    reelActionText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    // For You Grid
    // Story Modal
    storyModalContainer: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
    storyModalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1 },
    storyModalAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    storyModalUsername: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    storyModalClose: { marginLeft: 'auto' },
    storyModalImage: { flex: 1, width: '100%', height: '100%' },
    storyModalInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
    storyModalInput: { flex: 1, color: '#FFF', height: 40, borderColor: '#555', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, marginRight: 10 },
});
