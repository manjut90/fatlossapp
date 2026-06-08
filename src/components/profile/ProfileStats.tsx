import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function ProfileStats({
  value,
  label,
}: any) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 30,
    },

    title: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 18,
    },

    card: {
      backgroundColor: '#111',
      borderRadius: 28,
      padding: 22,
    },

    row: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 20,
    },

    statBox: {
      width: '48%',
      backgroundColor: '#181818',
      borderRadius: 20,
      paddingVertical: 24,
      alignItems: 'center',
    },

    value: {
      color: '#F7C873',
      fontSize: 24,
      fontWeight: '800',
    },

    label: {
      color: '#777',
      marginTop: 8,
      fontSize: 13,
    },
  });
