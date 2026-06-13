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
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
var react_1 = require("react");
var supabase_1 = require("../services/supabase");
var AuthContext = (0, react_1.createContext)(null);
function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var mounted = (0, react_1.useRef)(true);
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)(null), profile = _c[0], setProfile = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(true), profileLoading = _e[0], setProfileLoading = _e[1];
    /* FETCH PROFILE */
    var fetchProfile = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, _b, newProfile, insertError, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    setProfileLoading(true);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single()];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (!error) return [3 /*break*/, 5];
                    if (!(error.code === 'PGRST116')) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase
                            .from('profiles')
                            .insert({ id: userId, onboarding_completed: false })
                            .single()];
                case 2:
                    _b = _c.sent(), newProfile = _b.data, insertError = _b.error;
                    if (insertError) {
                        setProfile(null);
                    }
                    else {
                        setProfile(newProfile);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setProfile(null);
                    _c.label = 4;
                case 4:
                    setProfileLoading(false);
                    return [2 /*return*/];
                case 5:
                    setProfile(data);
                    setProfileLoading(false);
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _c.sent();
                    console.error('FETCH PROFILE FAILED:', e_1);
                    setProfileLoading(false);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    /* REFRESH PROFILE */
    var refreshProfile = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    return [4 /*yield*/, fetchProfile(user.id)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /* SIGN UP */
    var signUp = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.auth.signUp({
                        email: email,
                        password: password,
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (!((data === null || data === void 0 ? void 0 : data.user) &&
                        !error)) return [3 /*break*/, 3];
                    /* CREATE PROFILE */
                    return [4 /*yield*/, supabase_1.supabase
                            .from('profiles')
                            .insert({
                            id: data.user.id,
                            onboarding_completed: false,
                        })];
                case 2:
                    /* CREATE PROFILE */
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, {
                        data: data,
                        error: error,
                    }];
            }
        });
    }); };
    /* SIGN IN */
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    /* SIGN OUT */
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.auth.signOut()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /* SESSION */
    (0, react_1.useEffect)(function () {
        /* EXISTING SESSION */
        supabase_1.supabase.auth
            .getSession()
            .then(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var currentUser;
            var session = _b.data.session;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!mounted.current)
                            return [2 /*return*/];
                        currentUser = session === null || session === void 0 ? void 0 : session.user;
                        setUser(currentUser || null);
                        if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetchProfile(currentUser.id)];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        setProfile(null);
                        setProfileLoading(false);
                        _c.label = 3;
                    case 3:
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); })
            .catch(function () {
            if (!mounted.current)
                return;
            setUser(null);
            setProfile(null);
            setLoading(false);
            setProfileLoading(false);
        });
        /* AUTH LISTENER */
        var listener = supabase_1.supabase.auth.onAuthStateChange(function (_event, session) { return __awaiter(_this, void 0, void 0, function () {
            var currentUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!mounted.current)
                            return [2 /*return*/];
                        currentUser = session === null || session === void 0 ? void 0 : session.user;
                        setUser(currentUser || null);
                        if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetchProfile(currentUser.id)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        setProfile(null);
                        setProfileLoading(false);
                        _a.label = 3;
                    case 3:
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); }).data;
        return function () {
            mounted.current = false;
            listener.subscription.unsubscribe();
        };
    }, []);
    return (react_1.default.createElement(AuthContext.Provider, { value: {
            user: user,
            profile: profile,
            loading: loading,
            profileLoading: profileLoading,
            refreshProfile: refreshProfile,
            signUp: signUp,
            signIn: signIn,
            signOut: signOut,
        } }, children));
}
function useAuth() {
    return (0, react_1.useContext)(AuthContext);
}
