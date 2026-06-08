import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#171717',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },

  label: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  value: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },
});