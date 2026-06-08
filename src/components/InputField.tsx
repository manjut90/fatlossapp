import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
}

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    color: '#9CA3AF',
    marginBottom: 10,
    fontSize: 15,
  },

  input: {
    backgroundColor: '#0B0B0B',
    borderRadius: 18,
    padding: 18,
    color: '#FFFFFF',
    fontSize: 16,
  },
});