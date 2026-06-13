"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelUpModal = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var LevelUpModal = function (_a) {
    var visible = _a.visible, level = _a.level, title = _a.title, onClose = _a.onClose;
    return (react_1.default.createElement(react_native_1.Modal, { animationType: "fade", transparent: true, visible: visible, onRequestClose: onClose },
        react_1.default.createElement(react_native_1.View, { style: styles.centeredView },
            react_1.default.createElement(react_native_1.View, { style: styles.modalView },
                react_1.default.createElement(react_native_1.Text, { style: styles.headerText }, "\uD83C\uDF89 LEVEL UP"),
                react_1.default.createElement(react_native_1.Text, { style: styles.levelText },
                    "LEVEL ",
                    level),
                react_1.default.createElement(react_native_1.Text, { style: styles.titleText }, title),
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: onClose },
                    react_1.default.createElement(react_native_1.Text, { style: styles.buttonText }, "CONTINUE"))))));
};
exports.LevelUpModal = LevelUpModal;
var styles = react_native_1.StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
    },
    levelText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#8B7CFF', // A vibrant purple
        marginBottom: 10,
    },
    titleText: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 25,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#8B7CFF',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
