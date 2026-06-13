"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementUnlockedModal = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var AchievementUnlockedModal = function (_a) {
    var visible = _a.visible, name = _a.name, description = _a.description, onClose = _a.onClose;
    return (react_1.default.createElement(react_native_1.Modal, { animationType: "fade", transparent: true, visible: visible, onRequestClose: onClose },
        react_1.default.createElement(react_native_1.View, { style: styles.centeredView },
            react_1.default.createElement(react_native_1.View, { style: styles.modalView },
                react_1.default.createElement(react_native_1.Text, { style: styles.headerText }, "\uD83C\uDFC6 ACHIEVEMENT UNLOCKED"),
                react_1.default.createElement(react_native_1.Text, { style: styles.nameText }, name),
                react_1.default.createElement(react_native_1.Text, { style: styles.descriptionText }, description),
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: onClose },
                    react_1.default.createElement(react_native_1.Text, { style: styles.buttonText }, "CONTINUE"))))));
};
exports.AchievementUnlockedModal = AchievementUnlockedModal;
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700', // Gold color for achievement
        marginBottom: 10,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 16,
        color: '#B0B0B0',
        marginBottom: 25,
        textAlign: 'center',
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
