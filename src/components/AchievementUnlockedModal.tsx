import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AchievementUnlockedModalProps {
  visible: boolean;
  name: string;
  description: string;
  onClose: () => void;
}

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
  visible,
  name,
  description,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.headerText}>🏆 ACHIEVEMENT UNLOCKED</Text>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.descriptionText}>{description}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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