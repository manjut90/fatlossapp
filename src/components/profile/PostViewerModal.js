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
exports.default = PostViewerModal;
var react_1 = require("react");
var react_native_1 = require("react-native");
var lucide_react_native_1 = require("lucide-react-native");
var supabase_1 = require("../../services/supabase");
var AuthContext_1 = require("../../context/AuthContext");
function PostViewerModal(_a) {
    var _this = this;
    var visible = _a.visible, post = _a.post, onClose = _a.onClose;
    var user = (0, AuthContext_1.useAuth)().user;
    var _b = (0, react_1.useState)(false), isLiked = _b[0], setIsLiked = _b[1];
    var _c = (0, react_1.useState)(0), likesCount = _c[0], setLikesCount = _c[1];
    var _d = (0, react_1.useState)([]), comments = _d[0], setComments = _d[1];
    var _e = (0, react_1.useState)(0), commentsCount = _e[0], setCommentsCount = _e[1];
    var _f = (0, react_1.useState)(''), commentText = _f[0], setCommentText = _f[1];
    var _g = (0, react_1.useState)(true), loading = _g[0], setLoading = _g[1];
    (0, react_1.useEffect)(function () {
        if (visible && post) {
            fetchPostData();
        }
    }, [visible, post]);
    var fetchPostData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, likesData, likes, _b, rawComments, commentsTotal, commentUserIds, commentProfiles, _c, mergedComments;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!post || !(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    setLoading(true);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('reactions')
                            .select('*', { count: 'exact' })
                            .eq('post_id', post.id)];
                case 1:
                    _a = _d.sent(), likesData = _a.data, likes = _a.count;
                    setLikesCount(likes || 0);
                    setIsLiked((likesData === null || likesData === void 0 ? void 0 : likesData.some(function (l) { return l.user_id === user.id; })) || false);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('comments')
                            .select('*', { count: 'exact' })
                            .eq('post_id', post.id)
                            .order('created_at', { ascending: true })];
                case 2:
                    _b = _d.sent(), rawComments = _b.data, commentsTotal = _b.count;
                    commentUserIds = __spreadArray([], new Set((rawComments || []).map(function (c) { return c.user_id; })), true);
                    if (!(commentUserIds.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase_1.supabase.from('profiles').select('id, username, avatar_url').in('id', commentUserIds)];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = { data: [] };
                    _d.label = 5;
                case 5:
                    commentProfiles = (_c).data;
                    mergedComments = (rawComments || []).map(function (c) { return (__assign(__assign({}, c), { profiles: (commentProfiles || []).find(function (p) { return p.id === c.user_id; }) || null })); });
                    setComments(mergedComments);
                    setCommentsCount(commentsTotal || 0);
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleLike = function () { return __awaiter(_this, void 0, void 0, function () {
        var newLikedState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!post || !(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    newLikedState = !isLiked;
                    setIsLiked(newLikedState);
                    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);
                    if (!newLikedState) return [3 /*break*/, 2];
                    return [4 /*yield*/, supabase_1.supabase.from('reactions').insert({ post_id: post.id, user_id: user.id })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, supabase_1.supabase.from('reactions').delete().match({ post_id: post.id, user_id: user.id })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleShare = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!post)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, react_native_1.Share.share({ message: "Check out this post!", url: post.image_url })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSendComment = function () { return __awaiter(_this, void 0, void 0, function () {
        var tempComment, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!post || !(user === null || user === void 0 ? void 0 : user.id) || !commentText.trim())
                        return [2 /*return*/];
                    tempComment = {
                        id: Date.now(),
                        text: commentText.trim(),
                        created_at: new Date().toISOString(),
                        profiles: { username: user.username, avatar_url: user.avatar_url },
                    };
                    setComments(__spreadArray(__spreadArray([], comments, true), [tempComment], false));
                    setCommentText('');
                    return [4 /*yield*/, supabase_1.supabase.from('comments').insert({
                            post_id: post.id,
                            user_id: user.id,
                            text: commentText.trim(),
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        // Optionally remove the temp comment and show an error
                    }
                    else {
                        fetchPostData(); // Re-fetch to get the latest comments
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    if (!post)
        return null;
    return (react_1.default.createElement(react_native_1.Modal, { visible: visible, transparent: true, animationType: "slide" },
        react_1.default.createElement(react_native_1.KeyboardAvoidingView, { behavior: react_native_1.Platform.OS === 'ios' ? 'padding' : 'height', style: styles.container },
            react_1.default.createElement(react_native_1.View, { style: styles.header },
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onClose },
                    react_1.default.createElement(lucide_react_native_1.X, { color: "#333", size: 24 }))),
            react_1.default.createElement(react_native_1.ScrollView, null, loading ? (react_1.default.createElement(react_native_1.ActivityIndicator, { size: "large", color: "#8B7CFF", style: { marginTop: 100 } })) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_native_1.Image, { source: { uri: post.image_url }, style: styles.image }),
                react_1.default.createElement(react_native_1.View, { style: styles.contentContainer },
                    react_1.default.createElement(react_native_1.View, { style: styles.actions },
                        react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleLike, style: styles.actionBtn },
                            react_1.default.createElement(lucide_react_native_1.Heart, { size: 24, color: "#FF4B4B", fill: isLiked ? '#FF4B4B' : 'none' }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.actionText }, likesCount)),
                        react_1.default.createElement(react_native_1.View, { style: styles.actionBtn },
                            react_1.default.createElement(lucide_react_native_1.MessageCircle, { size: 24, color: "#333" }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.actionText }, commentsCount)),
                        react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleShare, style: [styles.actionBtn, { marginLeft: 'auto' }] },
                            react_1.default.createElement(lucide_react_native_1.Share2, { size: 24, color: "#333" }))),
                    react_1.default.createElement(react_native_1.Text, { style: styles.caption }, post.content),
                    react_1.default.createElement(react_native_1.View, { style: styles.commentsSection },
                        react_1.default.createElement(react_native_1.Text, { style: styles.commentsTitle }, "Comments"),
                        comments.map(function (comment) {
                            var _a, _b;
                            return (react_1.default.createElement(react_native_1.View, { key: comment.id, style: styles.comment },
                                react_1.default.createElement(react_native_1.Image, { source: { uri: ((_a = comment.profiles) === null || _a === void 0 ? void 0 : _a.avatar_url) || 'https://i.pravatar.cc/150' }, style: styles.commentAvatar }),
                                react_1.default.createElement(react_native_1.View, { style: styles.commentBody },
                                    react_1.default.createElement(react_native_1.Text, { style: styles.commentUser }, ((_b = comment.profiles) === null || _b === void 0 ? void 0 : _b.username) || 'User'),
                                    react_1.default.createElement(react_native_1.Text, { style: styles.commentText }, comment.text))));
                        })))))),
            react_1.default.createElement(react_native_1.View, { style: styles.inputContainer },
                react_1.default.createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Add a comment...", value: commentText, onChangeText: setCommentText }),
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: handleSendComment },
                    react_1.default.createElement(lucide_react_native_1.Send, { color: "#8B7CFF", size: 24 }))))));
}
var styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    image: { width: '100%', aspectRatio: 1 },
    contentContainer: { padding: 16 },
    actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 },
    actionText: { fontWeight: '600', fontSize: 16 },
    caption: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
    commentsSection: { marginTop: 20 },
    commentsTitle: { fontWeight: '800', fontSize: 16, marginBottom: 10 },
    comment: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18 },
    commentBody: { flex: 1 },
    commentUser: { fontWeight: '700' },
    commentText: { marginTop: 2 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', gap: 10 },
    input: { flex: 1, backgroundColor: '#F7F8FC', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
});
