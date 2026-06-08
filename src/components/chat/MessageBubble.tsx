import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

// Renders **bold** markdown as actual bold text
function renderMarkdown(text: string, isUser: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text
          key={index}
          style={[
            styles.bold,
            isUser && { color: '#FFFFFF' },
          ]}
        >
          {part.slice(2, -2)}
        </Text>
      );
    }
    return (
      <Text
        key={index}
        style={[
          styles.normal,
          isUser && { color: '#FFFFFF' },
        ]}
      >
        {part}
      </Text>
    );
  });
}

export default function MessageBubble({ role, message }: any) {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.coachRow]}>

      {/* COACH AVATAR */}
      {!isUser && (
        <View style={styles.coachAvatar}>
          <Text style={styles.coachAvatarText}>N</Text>
        </View>
      )}

      {/* BUBBLE */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.coachBubble]}>
        <Text style={[styles.message, isUser && { color: '#FFFFFF' }]}>
          {renderMarkdown(message, isUser)}
        </Text>
      </View>

      {/* USER AVATAR */}
      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>M</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  coachRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  coachAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  coachAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8E4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },
  userAvatarText: {
    color: '#8B7CFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '74%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  coachBubble: {
    backgroundColor: '#F4F1FF',
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: '#8B7CFF',
    borderBottomRightRadius: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111111',
    fontWeight: '500',
  },
  normal: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111111',
    fontWeight: '500',
  },
  bold: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111111',
    fontWeight: '800',
  },
});