import React, {
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';

import {
  User,
  Bell,
  Moon,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function SettingsSheet({
  visible,
  onClose,
}: any) {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* HEADER */}

          <View
            style={
              styles.headerRow
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Settings
            </Text>

            <TouchableOpacity
              onPress={onClose}
            >
              <Text
                style={
                  styles.close
                }
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >
            {/* ACCOUNT */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Account
            </Text>

            <SettingsButton
              icon={
                <User
                  size={18}
                  color="#fff"
                />
              }
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />

            <SettingsButton
              icon={
                <Shield
                  size={18}
                  color="#fff"
                />
              }
              title="Privacy Settings"
              onPress={() => navigation.navigate('Settings')}
            />

            {/* NOTIFICATIONS */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Notifications
            </Text>

            <ToggleRow
              icon={
                <Bell
                  size={18}
                  color="#fff"
                />
              }
              title="Push Notifications"
              value={
                notifications
              }
              onChange={
                setNotifications
              }
            />

            {/* APPEARANCE */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Appearance
            </Text>

            <ToggleRow
              icon={
                <Moon
                  size={18}
                  color="#fff"
                />
              }
              title="Dark Mode"
              value={darkMode}
              onChange={
                setDarkMode
              }
            />

            {/* PRIVACY */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Privacy
            </Text>

            <ToggleRow
              icon={
                <Shield
                  size={18}
                  color="#fff"
                />
              }
              title="Private Profile"
              value={
                privateProfile
              }
              onChange={
                setPrivateProfile
              }
            />

            {/* LOGOUT */}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={signOut}
            >
              <LogOut
                size={18}
                color="#ff4d6d"
              />

              <Text
                style={
                  styles.logoutText
                }
              >
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SettingsButton({
  icon,
  title,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <View
        style={
          styles.leftSection
        }
      >
        <View
          style={
            styles.iconWrap
          }
        >
          {icon}
        </View>

        <Text
          style={
            styles.buttonText
          }
        >
          {title}
        </Text>
      </View>

      <ChevronRight
        size={18}
        color="#666"
      />
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  title,
  value,
  onChange,
}: any) {
  return (
    <View style={styles.button}>
      <View
        style={
          styles.leftSection
        }
      >
        <View
          style={
            styles.iconWrap
          }
        >
          {icon}
        </View>

        <Text
          style={
            styles.buttonText
          }
        >
          {title}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={
          onChange
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      justifyContent:
        'flex-end',

      backgroundColor:
        'rgba(0,0,0,0.6)',
    },

    sheet: {
      backgroundColor: '#111',

      borderTopLeftRadius: 34,

      borderTopRightRadius: 34,

      paddingHorizontal: 22,

      paddingTop: 14,

      paddingBottom: 40,

      maxHeight: '88%',
    },

    handle: {
      width: 60,

      height: 5,

      borderRadius: 20,

      backgroundColor: '#333',

      alignSelf: 'center',

      marginBottom: 18,
    },

    headerRow: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      marginBottom: 24,
    },

    title: {
      color: '#fff',

      fontSize: 28,

      fontWeight: '800',
    },

    close: {
      color: '#777',

      fontSize: 14,
    },

    sectionTitle: {
      color: '#777',

      fontSize: 13,

      fontWeight: '700',

      marginBottom: 12,

      marginTop: 22,

      textTransform:
        'uppercase',
    },

    button: {
      backgroundColor: '#181818',

      borderRadius: 22,

      padding: 18,

      marginBottom: 14,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',
    },

    leftSection: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    iconWrap: {
      width: 40,

      height: 40,

      borderRadius: 14,

      backgroundColor: '#222',

      justifyContent:
        'center',

      alignItems: 'center',

      marginRight: 14,
    },

    buttonText: {
      color: '#fff',

      fontSize: 15,

      fontWeight: '600',
    },

    logoutButton: {
      backgroundColor:
        'rgba(255,77,109,0.08)',

      borderRadius: 22,

      padding: 18,

      marginTop: 30,

      flexDirection: 'row',

      justifyContent:
        'center',

      alignItems: 'center',
    },

    logoutText: {
      color: '#ff4d6d',

      fontSize: 16,

      fontWeight: '700',

      marginLeft: 10,
    },
  });