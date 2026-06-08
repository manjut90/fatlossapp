import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
  },

  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});