import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  message: string;
};

export default function SuccessToast({
  visible,
  message,
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.toast}>
        <Text style={styles.emoji}>
          🎉
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',

    top: 70,

    left: 0,

    right: 0,

    alignItems: 'center',

    zIndex: 999,
  },

  toast: {
    backgroundColor: '#111111',

    paddingHorizontal: 18,

    paddingVertical: 14,

    borderRadius: 18,

    flexDirection: 'row',

    alignItems: 'center',

    shadowColor: '#000',

    shadowOpacity: 0.2,

    shadowRadius: 10,

    elevation: 10,
  },

  emoji: {
    fontSize: 18,

    marginRight: 10,
  },

  message: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '600',
  },
});